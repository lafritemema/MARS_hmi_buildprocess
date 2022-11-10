
import CheckIcon from '@mui/icons-material/Check'
import {Typography, 
  Stack, 
  CircularProgress, 
  Fab} from "@mui/material";


function ActionDescription(props) {
  
  const action = props.action;
  const status = props.status

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
    <Stack 
        direction='row'
        spacing={5}
        alignContent='center'
        alignItems='center'>
      <Stack spacing={2} width='30em'>
        <Typography component="div" variant="h5">
          {action.type}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div">
          {action.description}
        </Typography>
      </Stack>
      {getStatus(status)}
    </Stack>);
}

export default ActionDescription;