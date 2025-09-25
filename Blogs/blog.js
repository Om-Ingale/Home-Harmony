const people = [
    { name: "Om Ingale - Fabien Pinckaers", ppt: "./files/Ed_Odoo_PPT.pptx", report: "./files/odoo Report.pdf.pdf" },
    { name: "Govind Nair - Roger Beteille", ppt: "./files/Roger Beteille.pptx", report: "./files/Roger Beteille.pdf" },
    { name: "Ayush Jha - Reed hastings", ppt: "./files/Reed Hastings.pptx", report: "./files/Report on Reed Hastings.pdf" },
    { name: "Pratik Jogdand", ppt: "ppt4.pdf", report: "report4.pdf" }
];

const container = document.getElementById("container");

people.forEach(person => {
    const box = document.createElement("div");
    box.className = "person-box";

    box.innerHTML = `
        <h2>${person.name}</h2>
        <a href="${person.ppt}" target="_blank">View PPT</a>
        <a href="${person.report}" target="_blank">View Report</a>
    `;

    container.appendChild(box);
});
