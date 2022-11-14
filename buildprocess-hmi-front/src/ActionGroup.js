import { Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Stack,
  Tooltip,
  Fab} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import CheckIcon from '@mui/icons-material/Check'
import PersonIcon from '@mui/icons-material/Person'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

function ActionGroup(props) {

  const group = props.group;
  const index = props.index;
  const onChange = props.onChange;
  const expanded = props.expanded;
  const status = props.status;

  const [progress, setProgress] = useState(0)

  const getTitle = (actor) => {
    switch(actor) {
      case 'human':
        return 'ACTION OPERATEUR';
      case 'robot':
        return 'SEQUENCE ROBOT';
      default:
        return 'SEQUENCE ROBOT';
    }
  }

  const getIcon = (actor)=>{
    switch(actor) {
      case 'human':
        return <PersonIcon/>;
      case 'robot':
        return <PrecisionManufacturingIcon/>;
      default:
        return  <PrecisionManufacturingIcon/>;
    }
  }

  useEffect(()=>{
    const progressMap = group.actions.map((action)=>status(action.uid) === 'done');
    const progress = progressMap.reduce((previous, current) => {
      return previous + current;
    }, false);
    setProgress(progress);
  }, [status])

  const sx = {
    title: { width:'10em', flexShrink: 0 },
    secondary: { color: 'text.secondary' }
  }

  const getIconStatus = (status) => {
    switch(status) {
      case 'inprogress':
        return <CircularProgress />;
      case 'done':
        return <CheckIcon />;
      default:
        return undefined;
    }
  }

  const actions = group.actions.map((action, index)=>{
    return (
      <Stack 
          key={'action'+index}
          direction='row'
          spacing={1.5}
          alignContent='center'
          alignItems='center'>
        <Tooltip title={action.description}>
          <Typography component="li" variant="h6">
            {action.type}
          </Typography>
        </Tooltip>
        {getIconStatus(status(action.uid))}
      </Stack>
    );
  });

  return (
    <Accordion
        expanded={expanded === index}
        onChange={onChange} >
      <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header">
        <Stack direction='row' spacing={2.5}>
          <Fab>
             {getIcon(group.actor)}
          </Fab>
          <Stack>
            <Typography sx={sx.title} typography='h5'>
              {getTitle(group.actor)}
            </Typography>
            <Typography sx={sx.secondary}>
              N° de taches: {group.actions.length}
            </Typography>
          </Stack>
        </Stack>
        <CircularProgress
          variant="determinate"
          value={(progress/group.actions.length)*100} />
      </AccordionSummary>
      <AccordionDetails>
        <Stack maxHeight='30em' overflow='auto'>
          {actions}
        </Stack>
      </AccordionDetails>
      </Accordion>
  );
}

export default ActionGroup