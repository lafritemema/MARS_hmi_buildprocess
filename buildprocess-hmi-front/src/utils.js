
export function* actionGroupGenerator(
    actions,
    status) {
  
  let i = 0;

  let alist=[];
  let slist=[];

  let actor = actions[0] ?
      getActor(actions[0].assets) :
      'robot';
  
  while(i < actions.length){
    const assets = actions[i].assets;
    const currentActor = getActor(assets);
    
    if(currentActor === actor) {
      alist.push(actions[i]);
      slist.push(status[actions[i].uid]);
    } else {
      yield {actor: actor,
             actions:alist,
             status:slist}
          
      alist = [actions[i]];
      slist = [status[actions[i].uid]];
      
      actor = currentActor;
    }
    i+=1;
  }
  return undefined;
}

function getActor(assets) {
  for(const asset of assets) {
    if (asset.uid === 'human') return 'human';
  }
  return 'robot'
}
