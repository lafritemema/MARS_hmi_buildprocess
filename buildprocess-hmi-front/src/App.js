import './App.css';
import React, { useEffect, useState } from 'react';
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
  const [buildProcess, setBuildProcess] = useState([]);
  const [progress, setProgress] = useState({
    currentAction:null,
    doneActions:[],
  })

  // init state for applications
  const [isConnected, setIsConnected] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sequenceView, setSequenceView] = useState(undefined);
  

  useEffect(() => {
    if(socket) {
        
      socket.on('initStates', (stateObject)=>{
        console.log('init build process status')
        const {buildProcess,
            doneActions,
            currentAction} = stateObject;
        setBuildProcess(buildProcess ? buildProcess : []);
        setProgress({currentAction:currentAction,
              doneActions: doneActions ? doneActions : []})
      });

      socket.on('progressUpdate', (progress) => {
        const {currentAction, doneActions} = progress
        setProgress({currentAction:currentAction,
          doneActions: doneActions ? doneActions : []})
      });

      socket.on('buildProcessUpdate', (buildProcess)=>{
        setBuildProcess(buildProcess ? buildProcess : []);
      });
      

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

  const expandView = ()=>{
    setExpanded(!expanded);
  }


  const getCompletedBP= () => {
    let cbp = []
    buildProcess.forEach((action)=>{
      let status = undefined;
      if (action.uid == progress.currentAction){
        status = 'inprogress'
      }
      else if (progress.doneActions.indexOf(action.uid)>-1){
        status = 'done'
      }
      cbp.push({...action, status: status});
    });
    return cbp;
  }
  
  return (
    <div >
       <FormControlLabel control={
                <Switch
                    checked={expanded}
                    onChange={expandView}
                    inputProps={{ 'aria-label': 'controlled' }}/>}
                label = "UNCOLLAPSE" />
      <div className='buildprocess'>
        <div className='view'>
          { expanded ? 
            <CardView buildprocess={getCompletedBP()}/> : 
            <GroupView buildprocess={getCompletedBP()}/>}
        </div>
      </div>
    </div>
  );
}

export default App;
