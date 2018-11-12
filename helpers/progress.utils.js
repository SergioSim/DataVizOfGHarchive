
export class Progress {
    _progressElement;

    constructor(progressElement){
        this._progressElement = progressElement;
    }

    show = () => { 
        this._progressElement.style.display = 'block'; 
        this._progressElement.value = 0; 
    };

    hide = () => { 
        this._progressElement.style.display = 'none'; 
    };

    endFiltering = (maxValue) => { 
        this._progressElement.max = maxValue+500; 
        this._progressElement.value+= 250; 
    };

    endProcess = () => { 
        this._progressElement.value+=250;
        this.hide();
    };
    
}