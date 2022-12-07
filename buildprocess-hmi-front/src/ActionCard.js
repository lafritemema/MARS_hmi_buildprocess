import Asset from "./Asset";
import CheckIcon from '@mui/icons-material/Check'
import {Typography, 
  Stack, 
  Card, 
  CircularProgress, 
  Fab} from "@mui/material";
  import React from "react";

function ActionCard({action}) {
  
  const sx = {
    padding: 1.5
  }
  
  const assets = action.assets.map((asset)=>{
    return (<Asset key={asset.uid} asset={asset}/>)
  });

  const getStatus = (status) => {
    switch(status) {
      case 'inprogress':
        return <CircularProgress />;
      case 'done':
        return <Fab color='success'><CheckIcon /></Fab>;
      default:
        return undefined;
    }
  }
  
  return (
    <Card sx={sx}>
      <Stack 
          direction='row'
          spacing={5}
          alignContent='center'
          alignItems='center'>
        <Stack spacing={2} width='80%'>
          <Typography component="div" variant="h5">
            {action.type}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {action.description}
          </Typography>
          <Stack direction="row"
              spacing={0.2}
              alignItems='right'>
            {assets}
          </Stack>
        </Stack>
        {getStatus(action.status)}
      </Stack>
    </Card>
  );
}

export default ActionCard;