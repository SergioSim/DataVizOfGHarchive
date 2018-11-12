/**
 * Append in page an accordion containing analysis
 *
 * @export
 * @param {string} id
 * @param {string} title
 * @param {callback} onStart
 * @param {callback} onUpdate
 * @param {{component: 'range' | 'button', title: string, min?: number, max?: number, initialValue?:number, clickHandler? (any)}} updateElement
 */
export function makeAnalysisContainer (id, title, onStart, onUpdate, updateComponentConfig) {
    const selector = "#charts-"+id+"-container";
    const graphSelector = selector.substring(1).replace('-container', '');

    const here = document.querySelector(selector);
    // handle hot module reloading
    if(here){
        here.parentNode.parentNode.removeChild(here.parentNode)
    }

    const container = document.querySelector('.analysis-container');
    const div = document.createElement('div');

    let updateComponentString = null;

    switch(updateComponentConfig.component){
        case 'range':
            updateComponentString = `
                    <label for='slider-${id}'>${updateComponentConfig.title}</label>
                    <input                         
                        class="update-handler" 
                        id="slider-${id}"
                        type="range" 
                        min="${updateComponentConfig.min}" 
                        max="${updateComponentConfig.max}" 
                        value="${updateComponentConfig.initialValue}">`;
            break;
        case 'button':
        default:
            updateComponentString = `<button id="update-${id}" class="update-handler">${updateComponentConfig.title}</button>`;
    }

    const accordionButton = `<button class="accordion" id="${id}">${title}</button>`;
    const panel = `
    <div class="panel" id="${selector.substring(1)}">
          <input type="text" class="date-label" value="2018-01-01-15" />
          <button class="analysis-start">Analyser!</button>
          <div id="${graphSelector}" class="pie"></div>
          ${updateComponentString}
    </div>
    `;
    
    const analysis = accordionButton.concat(panel);
    div.innerHTML = analysis;

    container.appendChild(div);

    const input = div.querySelector('.date-label');
    const pie = div.querySelector('.pie');
    const update = div.querySelector('.update-handler');
    update.addEventListener('change', onUpdate);

    const context = {
        id,
        title,
        pie,
        input
    };

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