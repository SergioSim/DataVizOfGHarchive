
export class Progress {
    _progressElement;
    _progressTitle;

    constructor(progressElement, progressTitle){
        this._progressTitle = progressTitle;
        this._progressElement = progressElement;
    }

    show = (title = "Analyse en cours") => {
        this._progressTitle.innerText = title;
        this._progressTitle.style.display = 'block'; 
        this._progressElement.style.display = 'block'; 
        this._progressElement.value = 0; 
    };

    add = (value) => {
        this._progressElement.value += value;
    }

    hide = () => { 
        this._progressTitle.innerText = '';
        this._progressTitle.style.display = 'none'; 
        this._progressElement.style.display = 'none'; 
    };

    total = (maxValue) => { 
        this._progressElement.max = maxValue; 
    };
}