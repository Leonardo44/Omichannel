const moment = require('moment');
moment().locale('es_sv');

module.exports = {
    changeIntervalData: (initDate, endDate, interval, callback, _) => {
        let $flag = true, auxDate = [];
    
        while($flag){
            if(auxDate.length === 0){
                let auxLimit = initDate.clone();
                auxLimit.add(interval.cant, interval.type)
                
                auxDate = [initDate.clone(), auxLimit.clone()];
            }else{
                let _aux = auxDate[1].clone();
                
                auxDate[0] = auxDate[1].clone();
                auxDate[0].add(1, 'm');
                
                _aux.add(interval.cant, interval.type);
                
                if(_aux >= endDate){
                    auxDate[1] = endDate.clone();
                    $flag = false;
                }else{
                    auxDate[1] = _aux.clone();
                }
            }
    
            if(typeof callback === 'function'){
                callback(auxDate[0], auxDate[1]);
            }
        }

        if(typeof callback === 'function'){
            _();
        }
    }     
}