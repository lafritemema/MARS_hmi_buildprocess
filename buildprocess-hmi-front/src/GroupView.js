import ActionGroup from "./ActionGroup";
import { Stack } from "@mui/material";
import React, { useState } from "react";
import { actionGroupGenerator } from "./utils";

function GroupView({buildprocess}) {
  
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (index)=>{
    return (exevent, isexpanded) =>{
      setExpanded(isexpanded ? index : false);
    }
  }
  let sequence = undefined;
  
  if (buildprocess) {

    const actionGroups = []
    
    const actGen = actionGroupGenerator(
        buildprocess);
    
    for (const group of actGen) {
      actionGroups.push(group);
    }

    sequence = actionGroups.map((group, index)=>{
      return (
      <ActionGroup
          key={'group'+index}
          group={group}
          index={index}
          expanded={expanded}
          onChange={handleChange(index)} />);
      });
  }

  return (
      <Stack spacing={1.5} padding={1.5}>
        {sequence}
      </Stack>
  )
}

export default GroupView