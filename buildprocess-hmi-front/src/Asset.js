import {Avatar,
  Tooltip} from '@mui/material';
import {Person,
  PrecisionManufacturing,
  QuestionMark} from '@mui/icons-material'
import { blue } from '@mui/material/colors';

function Asset(props) {
  const asset = props.asset

  const sx = {
    bgcolor: blue[500]
  }

  const getAsset = (uid)=>{
    switch(uid) {
      case 'human':
        return <Person />
      case 'mars':
        return <PrecisionManufacturing />
      case 'web_c_drilling':
        return 'W';
      case 'flange_c_drilling':
        return 'F';
      default:
        return <QuestionMark />
    }
  }

  return (
    <Tooltip title={asset.uid}>
      <Avatar sx={sx}>
        {getAsset(asset.uid)}
      </Avatar>
    </Tooltip>
  )
}

export default Asset