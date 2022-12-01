import ActionCard from './ActionCard';
import { Stack } from '@mui/material';

function CardView({buildprocess}) {
    
  const sequence = buildprocess.length > 0 ?
    buildprocess.map((action)=>{
      return (
        <ActionCard 
          key={action.uid}
          action={action} />
      )
    }) :
    undefined;

  return (
    <Stack spacing={1.5} padding={1.5}>
        {sequence}
    </Stack>
  );
}

export default CardView;