import ActionGroup from "./ActionGroup";
import { Stack } from "@mui/material";
import { useState } from "react";
import { actionGroupGenerator } from "./utils";

function GroupView(props) {
  
  const [expanded, setExpanded] = useState(false);
  const buildprocess = props.buildprocess;
  const status = props.status;
  
  const actionGroups = []
  const actGen = actionGroupGenerator(
      buildprocess,
      status);
  
  for (const group of actGen) {
    actionGroups.push(group);
  }
  
  const handleChange = (index)=>{
    return (exevent, isexpanded) =>{
      setExpanded(isexpanded ? index : false);
    }
  }

  const sequence = actionGroups.map((group, index)=>{
    return (
    <ActionGroup
        key={'group'+index}
        group={group}
        index={index}
        expanded={expanded}
        onChange={handleChange(index)} />);
  });

  return (
      <Stack spacing={1.5} padding={1.5}>
        {sequence}
      </Stack>
  )
}

export default GroupView