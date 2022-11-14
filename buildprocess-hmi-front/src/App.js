import './App.css';
import { useEffect, useState } from 'react';
import CardView from './CardView'
import GroupView from './GroupView'
import { FormControlLabel, Switch } from '@mui/material';
import io from "socket.io-client";

function App(props) {
  // get endpoint
  const ENDPOINT = props.endpoint;


  // init socket
  const socketOption = {
    autoConnect:false,
    reconnection:false
  }
  const socket = io(
      ENDPOINT,
      socketOption);
  
  /*const buildprocess = props.buildprocess;
  const status = props.status;
  */

  // init state for builprocess status
  const [buildProcess, setBuildProcess] = useState(null);
  const [progress, setProgress] = useState({
    currentAction:null,
    doneActions:[],
  })

  // init state for applications
  const [isConnected, setIsConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sequenceView, setSequenceView] = useState(undefined);
  

  const initData = (buildProcess,
    doneActions,
    currentAction)=>{
    const progress = {}
    
    /*doneActions.forEach((uid)=>{
      progress[uid] = 'done';
    })*/

    // progress[currentAction] = 'inprogress';

    setBuildProcess(buildProcess);
    setProgress({currentAction:currentAction,
      doneActions:doneActions})
  }

  // 
  useEffect(() => {
    if(socket) {
        
      socket.on('initStates', (stateObject)=>{
        console.log('init build process status')
        const {buildProcess,
            doneActions,
            currentAction} = stateObject;
        initData(buildProcess, doneActions, currentAction);
      });

      socket.on('progressUpdate', (progress) => {
        console.log(progress)
        setProgress(progress)
      });

      socket.on('buildProcessUpdate', (buildProcess)=>{
        setBuildProcess(buildProcess);
      });
      
      /*socket.on('currentUpdate', (currentId)=>{
        console.log(`next action : ${currentId}`)
        setCurrentAction(currentId);
      });*/

      // on connect emit getStates
      // to get build process status
      socket.on('connect', ()=> {
        console.log('connected')
        setIsConnected(true);
        socket.emit('getStates');
      });

      // on disconnect try to reconnect
      socket.on('disconnect', () => {
        setIsConnected(false);
        socket.connect();
      });

      // if error timeout
      socket.on("connect_error", () => {
          console.log('socket connection error, try to reconnect in 1 s' )
          setTimeout(() => {
            socket.connect();
          }, 1000);
        });
      
      socket.connect();

      return () => {
          // socket.off('connect');
          socket.off('disconnect');
          // socket.off('initStates');
          // socket.off('progressUpdate')
          // socket.off('currentUpdate')
          // socket.off('pong');
      }
    }
  }, []);


  useEffect(()=>{
    if (expanded) {
      setSequenceView(<CardView
          buildprocess={buildProcess}
          status={getStatus} />);
    } else {
      setSequenceView(<GroupView
        buildprocess={buildProcess}
        status={getStatus} />);
    }
  }, [expanded, buildProcess, progress]);

  const expandView = ()=>{
    setExpanded(!expanded);
  }

  const getStatus = (actionId) =>{
    if (actionId === progress.currentAction){
      return 'inprogress'
    } else if (progress.doneActions.indexOf(actionId)>-1) {
      return 'done'
    }
  }



  return (
    <div>
       <FormControlLabel control={
                <Switch
                    checked={expanded}
                    onChange={expandView}
                    inputProps={{ 'aria-label': 'controlled' }}/>}
                label = "DEVELOPPER" />
      {sequenceView}
    </div>
  )
}

export default App;
