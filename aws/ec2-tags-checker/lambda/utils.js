const defaultTags = {
    'name': 'string',
    'hostname': 'string',
    'os_type': 'string',
    'application': 'string',
    'project_name': 'string',
    'project_code': 'string',
    'change_no': 'string',
    'primary_owner': 'email',
    'secondary_owner': 'email',
    'provision_type': 'string',
    'provision_date': 'date',
    'expiry_date': 'date',
    'server_role': 'string',
    'business_unit': 'string',
    'snapshot': "boolean"
}

//regular expression
const emailRegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);



function prepareHtml(table, headers) {
    let htmlBody = ``
    headers.forEach((header) => {
        htmlBody = header ? htmlBody + `<th>${header}</th>` : htmlBody;
    })
    htmlBody = "<tr>" + htmlBody + "</tr>"
    return `<!DOCTYPE html><html><style>
    #customers {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }
    #customers td, #customers th {
        border: 1px solid #ddd;
        padding: 8px;
    }
    #customers tr:nth-child(even){background-color: #f2f2f2;}
    #customers tr:hover {background-color: #ddd;}
    #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
    </style>
    <body><table id="customers"> ${htmlBody}${table}</table> </body></html>`
}

function prepareMailBody(instances) {
    let htmlTable = ``;
    let headers = Object.keys(instances[0]);
    instances.forEach((instance) => {
        const instanceElements = Object.keys(instance);
        instanceElements.forEach((element) => {
            htmlTable = instance[element] ? htmlTable + `<td>${instance[element]}</td>` : htmlTable + `<td>Not Mentioned</td>`;
        })
        htmlTable = '<tr>' + htmlTable + '</tr>';
    });
    return prepareHtml(htmlTable, headers);
}

function groupInstancesByOwners(instances) {
    return instances.reduce((owner, instance) => {
        if (instance.primaryOwner) {
            owner[instance.primaryOwner] = owner[instance.primaryOwner] || [];
            owner[instance.primaryOwner].push({
                instanceId: instance.instanceId,
                expiryDate: instance.expiryDate,
                name: instance.name,
                hostName: instance.hostName,
                changeNo: instance.changeNo,
                ipAddress: instance.ipAddress,
                projectCode: instance.projectCode
            })
        }
        if (instance.secondaryOwner) {
            owner[instance.secondaryOwner] = owner[instance.secondaryOwner] || [];
            owner[instance.secondaryOwner].push({
                instanceId: instance.instanceId,
                expiryDate: instance.expiryDate,
                name: instance.name,
                hostName: instance.hostName,
                changeNo: instance.changeNo,
                ipAddress: instance.ipAddress,
                projectCode: instance.projectCode
            })
        }
        return owner;
    }, {});
}

function convertKeysToLowercase(tags) {
    return tags.reduce((newTags, tag) => {
        newTags[tag.Key.toLocaleLowerCase()] = tag.Value;
        return newTags;
    }, {})
}

function convertToLoweCase(string){
   return string.toLocaleLowerCase()
}

function getRequiredInstanceInfo(instance) {
    let instanceObject = {
        instanceId: undefined,
        name: undefined,
        primaryOwner: undefined,
        secondaryOwner: undefined,
        expiryDate: undefined,
        hostName: undefined,
        changeNo: undefined,
        projectCode: undefined,
        ipAddress: undefined
    }
    instance.Tags.forEach((tag) => {
        if (instance.InstanceId) {
            instanceObject.instanceId = instance.InstanceId
        }
        if (convertToLoweCase(tag.Key) === "name" && tag.Value) {
            instanceObject.name = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "primary_owner" && tag.Value) {
            instanceObject.primaryOwner = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "secondary_owner" && tag.Value) {
            instanceObject.secondaryOwner = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "expiry_date" && tag.Value) {
            instanceObject.expiryDate = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "hostname" && tag.Value) {
            instanceObject.hostName = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "change_no" && tag.Value) {
            instanceObject.changeNo = tag.Value
        }
        if (convertToLoweCase(tag.Key) === "project_code" && tag.Value) {
            instanceObject.projectCode = tag.Value
        }
        if (instance.PrivateIpAddress) {
            instanceObject.ipAddress = instance.PrivateIpAddress
        }
    })
    return instanceObject;
}

function checkTags(tags) {
    const newTags = convertKeysToLowercase(tags);
    return Object.keys(defaultTags).every((tagName) => {
        if (newTags[tagName] && defaultTags[tagName] === "email") {
            return emailRegExp.test(newTags[tagName])
        }
        if (newTags[tagName] && defaultTags[tagName] === "date") {
            return !isNaN(new Date(newTags[tagName]))
        }
        return newTags[tagName];
    });
}

exports.checkTags = checkTags;
exports.getRequiredInstanceInfo = getRequiredInstanceInfo;
exports.groupInstancesByOwners = groupInstancesByOwners;
exports.prepareMailBody = prepareMailBody;
exports.convertKeysToLowercase = convertKeysToLowercase;
exports.convertToLoweCase = convertToLoweCase;