import './App.css';
import { useEffect, useState } from 'react';
import CardView from './CardView'
import GroupView from './GroupView'
import { FormControlLabel, Switch } from '@mui/material';

function App(props) {
  const buildprocess = props.buildprocess;
  const status = props.status;

  const [expanded, setExpanded] = useState(false);
  const [sequence, setSequence] = useState(undefined);

  useEffect(()=>{
    if (expanded) {
      setSequence(<CardView
          buildprocess={buildprocess}
          status={status}/>);
    } else {
      setSequence(<GroupView
        buildprocess={buildprocess}
        status={status}/>);
    }
  }, [expanded]);

  const expandView = ()=>{
    setExpanded(!expanded);
  }

  return (
    <div>
       <FormControlLabel control={
                <Switch
                    checked={expanded}
                    onChange={expandView}
                    inputProps={{ 'aria-label': 'controlled' }}/>}
                label = "DEVELOPPER" />
      {sequence}
    </div>
  )
}

export default App;
