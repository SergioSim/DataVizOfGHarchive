/**
 * Append in page an accordion containing analysis
 *
 * @export
 * @param {string} id
 * @param {string} title
 * @param {callback} onStart
 * @param {{component: 'range' | 'button', title: string, min?: number, max?: number, initialValue?:number, handler? (any)}} updateConfig
 */
function makeAnalysisContainer (id, title, config, i18n) {
    const selector = "#charts-"+id+"-container";
    const graphSelector = selector.substring(1).replace('-container', '');

    const here = document.querySelector(selector);
    // handle hot module reloading
    if(here){
        here.parentNode.parentNode.removeChild(here.parentNode)
    }

    const container = document.querySelector('.analysis-container');
    const div = document.createElement('div');

    let updateComponent = '';
    if(config && config.component){
        switch(config.component){
            case 'range':
                updateComponent = `
                        <label for='slider-${id}'>${config.title}</label>
                        <input                         
                            class="update-handler" 
                            id="slider-${id}"
                            type="range" 
                            min="${config.min}" 
                            max="${config.max}" 
                            value="${config.initialValue}">`;
                break;
            case 'button':
            default:
                updateComponent = `<button id="update-${id}" class="update-handler">${config.title}</button>`;
        }
    }

    const accordionButton = `<button class="accordion" id="${id}">${title}</button>`;
    const input = config.inputValue ? `<vaadin-date-picker label="${i18n.t('pickDate')}" value="${config.inputValue}"></vaadin-date-picker>` : "";
    const hourInput = config.inputValueHour ? `\t\t<vaadin-text-field placeholder="Ex : 24" pattern="2[0-3]|[01]?[0-9]" label="${i18n.t('pickHour')}" value="${config.inputValueHour}"></vaadin-text-field>` : "";
    let button = `<button class="analysis-start">${i18n.t('startAnalysis')}</button>`;
    if(!config.onStart) button = '';
    let panel = `
    <div class="panel" id="${selector.substring(1)}">
          ${input}
          ${hourInput}
          ${button}
          <div id="${graphSelector}" class="pie"></div>
          ${updateComponent}
    </div>
    `;
    
    const analysis = accordionButton.concat(panel);
    div.innerHTML = analysis;

    container.appendChild(div);

    const inputNode = div.querySelector('vaadin-date-picker');
    const inputHourNode = div.querySelector('vaadin-text-field');
    const pieNode = div.querySelector('.pie');
    const updateNode = div.querySelector('.update-handler');
    panel = div.querySelector('.panel');

    const context = {
        id,
        title,
        panel,
        pie: pieNode,
        input: inputNode,
        hourInput: inputHourNode,
        update: updateNode
    };

    if(config){
        if(config.onUpdate)
            config.onUpdate = config.onUpdate.bind(context);
        if(config.onMount){
            config.onMount = config.onMount.bind(context);
            config.onMount();
        }
        switch(config.component){
            case 'range':
                updateNode.addEventListener('change', config.onUpdate);
                break;
            case 'button':
                updateNode.addEventListener('click', config.onUpdate);
                break;
            default:
                // do nothing
        }
    }

    if(config.onStart){
        config.onStart = config.onStart.bind(context);
        div.querySelector('.analysis-start').addEventListener('click', config.onStart);
    }
}

/**
 * Used to bind accordions after every analysis is on page
 *
 * @export
 */
function bindAccordions() {
    const acc = document.querySelectorAll(".accordion");
    for(const accordion of acc){
        accordion.addEventListener('click', () => {
            accordion.classList.toggle('active');
            const panel = accordion.nextElementSibling;
            if (panel.style.opacity === "1") {
                panel.style.opacity = "0";
                panel.style.height = "0";
            } else {
                panel.style.opacity = "1";
                panel.style.height = "auto";
            }
        })
    }
}

function bindLangFlags(i18n){
    const flags = document.querySelectorAll('.flags span');
    for(const flag of flags){
        flag.addEventListener('click', () => {
            i18n.changeLanguage(flag.className);
        });
    }
}

export default {makeAnalysisContainer, bindAccordions, bindLangFlags};