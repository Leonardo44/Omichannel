const moment = require('moment');
moment().locale('es_sv');

module.exports = {
    getInterval: (currentInterval, initDate, endDate, interval) => {
        let assingAux = currentInterval[1] === null || interval.type === 'd' ? currentInterval[0] : currentInterval[1];
        let start = assingAux;
        let limit = moment(`${assingAux.format('YYYY')}-${assingAux.format('MM')}-${assingAux.format('DD')} ${endDate.time}`, 'YYYY-MM-DD HH:mm');
        
        if(currentInterval[1] !== null){
            currentInterval[0] = currentInterval[1].clone();

            if(interval.type === 'd'){
                currentInterval[0].add(1, 'd');
            }
        }

        currentInterval[0].set({
            hour: start.format('HH'),
            minute: parseInt(start.format('mm'))
        });
        
        let compareAux = currentInterval[0].clone();
        
        compareAux.set({
            hour: limit.format('HH'),
            minute: limit.format('mm'),
        })

        if(currentInterval[0].isSameOrAfter(compareAux)){
            currentInterval[0].add(1, 'd');
            compareAux.add(1, 'd');
            currentInterval[0].set({
                hour: initDate.moment.format('HH'),
                minute: parseInt(initDate.moment.format('mm'))
            });
        }
        
        let auxDate = currentInterval[0].clone();
        auxDate.add(interval.cant, interval.type);

        currentInterval[0].set({
            minute: parseInt(currentInterval[0].format('mm')) + (interval.type === 'd' || currentInterval[1] === null ? 0 : 1),
        });
        
        if(auxDate.isSameOrAfter(compareAux)){
            currentInterval[1] = compareAux.clone();
        }else{
            currentInterval[1] = auxDate.clone();
        }

        return currentInterval;
    }
}