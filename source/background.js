// check which browser
var api = (browser == undefined)?chrome:browser

var state = {
    interval : null,
    counter : 0,
    messages : [],
    polluters: [],
    target: null
}

// load key messages and polluters
fetch("./source/data.json").then(
    response => {
	response.json().then(
	    data => {
		data.messages.map(
		    (message) => {
			state.messages.push(message)})
		data.polluters.map(
		    (polluter) => {
			state.polluters.push(polluter)})
	    })})

var random = array => {
    return array[Math.floor(Math.random() * array.length)]
}

var urlify = sentence => {
    var delims = ["_","/",".","-","+"]
    var extensions = [
	"","php","asp",
	"css","html","htm","js",
	"gif","png","jpg","jpeg",
	"pdf","doc","docx","xsl","xslx"]
    while (sentence.match(/\s/)) {
	sentence = sentence.replace(/\s/, random(delims))
	sentence = sentence.replace(random(sentence),
	    (letter) => {return letter.toUpperCase()})
    }
    sentence = sentence + random(extensions)
    return sentence 
}

var toggle = settings => {
    let enable = settings.enable
    let target = settings.target
    let frequency = settings.frequency
    if (frequency < 300) {
	api.browserAction.setBadgeBackgroundColor({color:"rgba(20,170,55,1)"})
    } else if (frequency < 600) {
	api.browserAction.setBadgeBackgroundColor({color:"rgba(255,193,30,1)"})
    } else {
	api.browserAction.setBadgeBackgroundColor({color:"rgba(220,79,0,1)"})
    }
    if (enable) {
	if (state.interval) {
	    clearInterval(state.interval)
	    delete state.interval
	} else {
	    // only reset the counter when starting afresh
	    state.counter = 0
	}
	api.browserAction.setIcon({path:"./icons/active-32.png"})
	state.interval = setInterval(tell, 60/frequency*1000, target)
    } else {
	api.browserAction.setIcon({path:"./icons/inactive-32.png"})
	if (state.interval) {
	    api.browserAction.setBadgeText({text:"off"})
	    setTimeout(() => {api.browserAction.setBadgeText({text:""})}, 1000)
	    clearInterval(state.interval)
	    delete state.interval
	}
    }
}


var tell = async target => {
    var URL = "http://" + target + "/" + urlify(random(state.messages))
    let badge = (Math.floor(state.counter/30) % 2 === 0)?"⧖":"⧗"
    api.browserAction.setBadgeText({text:badge})
    // don't send any cookies or referrer and don't cache anything
    var response = await fetch(URL, {
	referrerPolicy: "no-referrer",
	cache: "no-store",
	credentials: "omit"
    }).catch(() => {
    })
	.then((response) => {
	    state.counter += 1
	    api.runtime.sendMessage(
		{type: "request", url: URL, counter: state.counter})
	})
}

var suggest = array => {
    let date = new Date()
    let choice = Math.pow(date.getUTCMonth(), date.getUTCDate()) // + date.getUTCHours()
    return array[choice % array.length]
}

api.runtime.onMessage.addListener(function(message){
    switch(message.type){
    case "toggle":
	toggle(message.settings)
	break
    case "data":
	api.runtime.sendMessage(
	    {type: "data",
	     polluters: state.polluters,
	     suggestion: suggest(state.polluters)
	    })
	break
    }})

