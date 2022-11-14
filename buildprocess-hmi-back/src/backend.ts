import process from 'node:process';
import { Server as SockioServer, Socket } from "socket.io";
import { loadAsync } from 'node-yaml-config';
import { createClient } from 'redis';
import Logger from '@common/logger';
import assert from 'node:assert';
import { RedisClientType } from '@redis/client';
import { createServer } from "http";

const CONFIG_FOLDER = process.cwd() + '/config';
const LOGGER = new Logger("HMI BuildProcess");

const enum KEYSPACE {
  SEQUENCE_ALL = 'mars.sequencer.sequence.all',
  SEQUENCE_TODO = 'mars.sequencer.sequence.uids.todo',
  SEQUENCE_DONE = 'mars.sequencer.sequence.uids.done',
  SEQUENCE_CURRENT = 'mars.sequencer.sequence.current'
}

// variables for redisClients
let redisClient:RedisClientType;
let subProcessAllClient:RedisClientType;
let subCurrentActionClient:RedisClientType;
// let subDoneActionsClient:RedisClientType;

let buildProcessAll:{[key:string]:any} | null;
let currentAction:string |null;
let doneActions:string[] = [];

// define interfaces
interface ServerToClientEvents {
  error:(message:string)=>void,
  initStates:(buildProcess:{},
      doneActions:string[],
      currentAction:string)=>void,
  progressUpdate:(progress:{})=>void;
  // currentUpdate:(currentId:string)=>void;
  buildProcessUpdate:(buildProcess:{})=>void;
}

interface ClientToServerEvents {
  getStates:()=>void;
}

interface RedisConfiguration {
  host:string,
  port:number,
  database:number,
}

// variable for socketio client
let socketIO:SockioServer<ClientToServerEvents, ServerToClientEvents>;

// load config and init clients
loadAsync(CONFIG_FOLDER + '/server.yaml')
  .then(async (config:{[key:string]:any})=>{
    const redis = <RedisConfiguration> config.redis;

    const HOST = process.env.HOST;
    const PORT = parseInt(process.env.PORT);
    assert(HOST && PORT, 'Missing environment variable HOST or PORT')

    LOGGER.try('init redis clients');
    // init redis client
    
    redisClient = createClient({
      socket: {
        host: redis.host,
        port: redis.port
      },
      database:redis.database
    });
    // and connect it
    await redisClient.connect();
    const [buildProcess, done, current] = await redisClient
        .multi()
        .get(KEYSPACE.SEQUENCE_ALL)
        .lRange(KEYSPACE.SEQUENCE_DONE, 0, 1000)
        .get(KEYSPACE.SEQUENCE_CURRENT)
        .exec();

    buildProcessAll = buildProcess ?
      JSON.parse(<string>buildProcess):
      null;
    currentAction = <string|null>current;
    doneActions = <string[]>(done ? done: doneActions);

    // init the sub clients
    // listening currentAction updates
    subCurrentActionClient = redisClient.duplicate()
    subCurrentActionClient.connect();
    subCurrentActionClient.subscribe(
        '__keyspace@0__:'+KEYSPACE.SEQUENCE_CURRENT,
        updateProgress);
    
    /* listening doneAction update
    subDoneActionsClient = redisClient.duplicate();
    subDoneActionsClient.connect();
    subDoneActionsClient.subscribe(
        '__keyspace@0__:'+KEYSPACE.SEQUENCE_DONE,
        updateDoneAction);
    */

    // listening buildProcessAll udpate
    subProcessAllClient = redisClient.duplicate();
    subProcessAllClient.connect();
    subProcessAllClient.subscribe(
      '__keyspace@0__:'+KEYSPACE.SEQUENCE_ALL,
      updateBuildProcess);
    
    LOGGER.success('init redis clients');

    LOGGER.try('init http server');
    const httpServer = createServer(()=>{
      console.log('new request');
    });
    LOGGER.success('init http server');

    LOGGER.try('init socketIO server');
    // build and configure socketIO server
    socketIO = new SockioServer<ClientToServerEvents, ServerToClientEvents>(
      httpServer, 
      {cors:{
        origin: '*',
        credentials:false}
      });
    
    socketIO.on('connection', (socket:Socket)=>{
      // status update
      // on connection getStates event expected
      // server send all current status
      socket.on('getStates', ()=>{
        const stateObject = {
          buildProcess: buildProcessAll,
          doneActions,
          currentAction
        }
        socket.emit('initStates', stateObject);
      });
    });

    LOGGER.success('init socketIO server');

    // start to listening on http
    httpServer.listen(PORT, HOST, ()=>{
      LOGGER.info(`http server listening on port ${PORT}`);
    });
    
  });

async function updateProgress(event:string) {
  switch (event) {
    case 'set':
      const [currAction, doneAction] = await redisClient
          .multi()
          .get(KEYSPACE.SEQUENCE_CURRENT)
          .lIndex(KEYSPACE.SEQUENCE_DONE, -1)
          .exec();

      currentAction = <string>currAction;
      doneActions.push(<string>doneAction);
      
      LOGGER.info(`next action to perform : ${currentAction}`);
      socketIO.emit('progressUpdate', {currentAction, doneActions});
      break;
    case 'del':
      currentAction = null;
      socketIO.emit('progressUpdate', {currentAction, doneActions});
      LOGGER.info(`end of process`);
      break;
    default:
  }
}

/*
async function updateDoneAction(event:string) {
  switch(event) {
    case 'rpush':
      const doneAction = <string> await redisClient
          .lIndex(KEYSPACE.SEQUENCE_DONE, -1);
      
      doneActions.push(doneAction);
      
      LOGGER.info(`action ${doneAction} done`);
      socketIO.emit('progressUpdate', doneActions);
      break;
    case 'del':
      doneActions = [];
      socketIO.emit('progressUpdate', null);
      LOGGER.info('purge done actions');
      break;
    default:
  }
}*/

async function updateBuildProcess(event:string) {
  switch (event) {
    case 'set':
      const bpString = <string> await redisClient
          .get(KEYSPACE.SEQUENCE_ALL);
      buildProcessAll = JSON.parse(bpString);
      
      LOGGER.info(`new build process loaded`);
      socketIO.emit('buildProcessUpdate', buildProcessAll);
      
      break;
    case 'del':
      buildProcessAll = null;
      socketIO.emit('buildProcessUpdate', null);
      LOGGER.info(`build process deleted`);
      break;
    default:
  }
}