import ActionCard from './ActionCard';
import { Stack } from '@mui/material';

function CardView(props) {
  
  const buildprocess = props.buildprocess;
  const status = props.status;

  const sequence = buildprocess.map((action)=>{
    return (
      <ActionCard 
        key={action.uid}
        action={action}
        status={status[action.uid]}/>
    )
  });

  return (
    <Stack spacing={1.5} padding={1.5}>
        {sequence}
    </Stack>
  );
}

export default CardView;