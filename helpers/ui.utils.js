/**
 * Append in page an accordion containing analysis
 *
 * @export
 * @param {string} id
 * @param {string} title
 * @param {callback} onStart
 * @param {{component: 'range' | 'button', title: string, min?: number, max?: number, initialValue?:number, handler? (any)}} updateConfig
 */
export function makeAnalysisContainer (id, title, inputValue, onStart, update, i18n) {
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
    if(update && update.component){
        switch(update.component){
            case 'range':
                updateComponent = `
                        <label for='slider-${id}'>${update.title}</label>
                        <input                         
                            class="update-handler" 
                            id="slider-${id}"
                            type="range" 
                            min="${update.min}" 
                            max="${update.max}" 
                            value="${update.initialValue}">`;
                break;
            case 'button':
            default:
                updateComponent = `<button id="update-${id}" class="update-handler">${update.title}</button>`;
        }
    }

    const accordionButton = `<button class="accordion" id="${id}">${title}</button>`;
    const input = inputValue ? `<input type="text" class="date-label" value="${inputValue}" />` : "";
    let panel = `
    <div class="panel" id="${selector.substring(1)}">
          ${input}
          <button class="analysis-start">${i18n.t('startAnalysis')}</button>
          <div id="${graphSelector}" class="pie"></div>
          ${updateComponent}
    </div>
    `;
    
    const analysis = accordionButton.concat(panel);
    div.innerHTML = analysis;

    container.appendChild(div);

    const inputNode = div.querySelector('.date-label');
    const pieNode = div.querySelector('.pie');
    const updateNode = div.querySelector('.update-handler');
    panel = div.querySelector('.panel');

    const context = {
        id,
        title,
        panel,
        pie: pieNode,
        input: inputNode,
        update: updateNode
    };

    if(update){
        if(update.onUpdate)
            update.onUpdate = update.onUpdate.bind(context);
        if(update.onMount){
            update.onMount = update.onMount.bind(context);
            update.onMount();
        }
        switch(update.component){
            case 'range':
                updateNode.addEventListener('change', update.onUpdate);
                break;
            case 'button':
                updateNode.addEventListener('click', update.onUpdate);
                break;
            default:
                // do nothing
        }
    } 

    onStart = onStart.bind(context);
    div.querySelector('.analysis-start').addEventListener('click', onStart);
}

/**
 * Used to bind accordions after every analysis is on page
 *
 * @export
 */
export function bindAccordions() {
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
export default {makeAnalysisContainer, bindAccordions};