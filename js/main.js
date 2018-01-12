"use strict";

let input = `
DEPEND   TELNET TCPIP NETCARD
DEPEND TCPIP NETCARD
DEPEND DNS TCPIP NETCARD
DEPEND  BROWSER   TCPIP  HTML
INSTALL NETCARD
INSTALL TELNET
INSTALL foo
REMOVE NETCARD
INSTALL BROWSER
INSTALL DNS
LIST
REMOVE TELNET
REMOVE NETCARD
REMOVE DNS
REMOVE NETCARD
INSTALL NETCARD
REMOVE TCPIP
REMOVE BROWSER
REMOVE TCPIP
LIST
END
`;

(function () {

    let inputLines = input.split("\n");
    let lineIndex = 0;
    let components = {};
    let installedComponents = [];

    while (inputLines[lineIndex] !== "END") {
        console.log(inputLines[lineIndex]);
        processLine(inputLines[lineIndex]);
        lineIndex++;
    }
    console.log(inputLines[lineIndex]);
    console.log(components);

    function addComponent(name, children, parents) {
        if (components[name]) {
            let component = components[name];
            component.children = component.children.concat(children);
            component.parents = component.parents.concat(parents);
        } else {
            components[name] = {
                name: name,
                children: children,
                parents: parents
            };
        }
    }

    function storeDependencies(parts) {
        let children = [];
        let component = null;
        for (let i = 1; i < parts.length; i++) {
            let part = parts[i].trim();
            if (part) {
                if (component) {
                    children.push(part);
                    addComponent(part, [], [component]);
                } else {
                    component = part;
                }
            }
        }
        addComponent(component, children, []);
    }

    function listComponents() {
        installedComponents.forEach(c => console.log(`\t${c}`));
    }

    function installComponentAndDependencies(name) {
        let component = components[name];
        if (component) {
            component.children.forEach(c => {
                let index = installedComponents.indexOf(c);
                if (index === -1) {
                    installComponentAndDependencies(c);
                }
            })
        }
        installedComponents.push(name);
        console.log(`\tInstalling ${name}`);
    }

    function installComponent(parts) {
        let name = getFirstComponentNameFromInput(parts);
        let index = installedComponents.indexOf(name);
        if (index !== -1) {
            console.log(`\t${name} is already installed.`);
        } else {
            installComponentAndDependencies(name);
        }
    }

    function removeComponent(parts) {
        let name = getFirstComponentNameFromInput(parts);
        let index = installedComponents.indexOf(name);
        if (index === -1) {
            console.log(`\t${name} is not installed.`);
        } else {
            removeElementInList(installedComponents, index);
            console.log(`\tRemoving ${name}`);
        }
    }

    function processLine(inputLine) {
        if (!inputLine || !inputLine.trim()) {
            return;
        }
        inputLine = inputLine.trim();
        let parts = inputLine.split(' ');
        let command = parts[0];
        switch (command) {
            case "DEPEND":
                storeDependencies(parts);
                break;
            case "LIST":
                listComponents();
                break;
            case "INSTALL":
                installComponent(parts);
                break;
            case "REMOVE":
                removeComponent(parts);
                break;
            default:
                console.warn(`stray ${command}`);
        }
    }

    function getFirstComponentNameFromInput(parts) {
        for (let i = 1; i < parts.length; i++) {
            let part = parts[i].trim();
            if (part) {
                return part;
            }
        }
    }

    function removeElementInList(list, index) {
        list.splice(index, 1);
    }
})();
