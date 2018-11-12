
export class Progress {
    _progressElement;

    constructor(progressElement){
        this._progressElement = progressElement;
    }

    show = () => { 
        debugProgress.style.display = 'block'; 
        debugProgress.value = 0; 
    };

    hide = () => { 
        debugProgress.style.display = 'none'; 
    };

    endFiltering = (maxValue) => { 
        debugProgress.max = maxValue+500; 
        debugProgress.value+= 250; 
    };

    endProcess = () => { 
        debugProgress.value+=250;
        this.hide();
    };
    
}