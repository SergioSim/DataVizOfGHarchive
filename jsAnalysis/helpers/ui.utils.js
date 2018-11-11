/**
 * Append in page an accordion containing analysis
 *
 * @export
 * @param {string} id
 * @param {string} title
 * @param {callback} onStart
 */
export function makeAnalysisContainer (id, title, onStart) {
    const container = document.querySelector('.analysis-container');
    const div = document.createElement('div');

    const accordionButton = `<button class="accordion" id="${id}">${title}</button>`;
    const panel = `
    <div class="panel">
          <input type="text" class="date-label" value="2018-01-01-15" />
          <progress class="progress" value="0"></progress>
          <button class="analysis-start">Analyser!</button>
          <div id="pie-${id}" class="pie"></div>
        </div>
    `;
    const analysis = accordionButton.concat(panel);
    div.innerHTML = analysis;

    container.appendChild(div);

    const input = div.querySelector('.date-label');
    const pie = div.querySelector('.pie');
    const progress = div.querySelector('.progress');

    const context = {
        id,
        title,
        pie,
        input,
        progress
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