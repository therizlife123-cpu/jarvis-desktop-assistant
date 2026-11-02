$(document).ready(function () {

    eel.init()()

    $('.text').textillate({
        loop: true,
        sync: true,
        in: { effect: "bounceIn" },
        out: { effect: "bounceOut" },
    });

    var siriWave = new SiriWave({
        container: document.getElementById("siri-container"),
        width: 800, height: 200, style: "ios9",
        amplitude: "1", speed: "0.30", autostart: true
    });

    $('.siri-message').textillate({
        loop: true, sync: true,
        in: { effect: "fadeInUp", sync: true },
        out: { effect: "fadeOutUp", sync: true },
    });

    $("#MicBtn").click(function () {
        eel.playAssistantSound();
        $("#Oval").attr("hidden", true);
        $("#SiriWave").attr("hidden", false);
        eel.allCommands()();
    });

    function doc_keyUp(e) {
        if (e.key === 'j' && e.metaKey) {
            eel.playAssistantSound();
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            eel.allCommands()();
        }
    }
    document.addEventListener('keyup', doc_keyUp, false);

    function PlayAssistant(message) {
        if (message != "") {
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            eel.allCommands(message);
            $("#chatbox").val("");
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
    }

    function ShowHideButton(message) {
        if (message.length == 0) {
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        } else {
            $("#MicBtn").attr('hidden', true);
            $("#SendBtn").attr('hidden', false);
        }
    }

    $("#chatbox").keyup(function () { ShowHideButton($("#chatbox").val()); });
    $("#SendBtn").click(function () { PlayAssistant($("#chatbox").val()); });
    $("#chatbox").keypress(function (e) {
        if (e.which == 13) PlayAssistant($("#chatbox").val());
    });

    eel.personalInfo()();
    eel.displaySysCommand()();
    eel.displayWebCommand()();
    eel.displayPhoneBookCommand()();

    eel.expose(getData);
    function getData(user_info) {
        let data = JSON.parse(user_info);
        let idsPersonalInfo = ['OwnerName', 'Designation', 'MobileNo', 'Email', 'City'];
        let idsInputInfo = ['InputOwnerName', 'InputDesignation', 'InputMobileNo', 'InputEmail', 'InputCity'];
        for (let i = 0; i < data.length; i++) {
            $("#" + idsPersonalInfo[i]).text(data[i]);
            $("#" + idsInputInfo[i]).val(data[i]);
        }
    }

    $("#UpdateBtn").click(function () {
        let OwnerName = $("#InputOwnerName").val();
        let Designation = $("#InputDesignation").val();
        let MobileNo = $("#InputMobileNo").val();
        let Email = $("#InputEmail").val();
        let City = $("#InputCity").val();
        if (OwnerName.length > 0 && Designation.length > 0 && MobileNo.length > 0 && Email.length > 0 && City.length > 0) {
            eel.updatePersonalInfo(OwnerName, Designation, MobileNo, Email, City);
            swal({ title: "Updated Successfully", icon: "success" });
        } else {
            const toast = new bootstrap.Toast(document.getElementById('liveToast'));
            $("#ToastMessage").text("All Fields Medatory");
            toast.show();
        }
    });

    eel.expose(displaySysCommand);
    function displaySysCommand(array) {
        let data = JSON.parse(array);
        let placeholder = document.querySelector("#TableData");
        let out = "";
        for (let i = 0; i < data.length; i++) {
            out += `<tr><td class="text-light">${i + 1}</td><td class="text-light">${data[i][1]}</td><td class="text-light">${data[i][2]}</td><td class="text-light"><button id="${data[i][0]}" onClick="SysDeleteID(this.id)" class="btn btn-sm btn-glow-red">Delete</button></td></tr>`;
        }
        placeholder.innerHTML = out;
    }

    $("#SysCommandAddBtn").click(function () {
        let key = $("#SysCommandKey").val(), value = $("#SysCommandValue").val();
        if (key.length > 0 && value.length) {
            eel.addSysCommand(key, value);
            swal({ title: "Updated Successfully", icon: "success" });
            eel.displaySysCommand()();
            $("#SysCommandKey").val(""); $("#SysCommandValue").val("");
        } else {
            const toast = new bootstrap.Toast(document.getElementById('liveToast'));
            $("#ToastMessage").text("All Fields Medatory"); toast.show();
        }
    });

    eel.expose(displayWebCommand);
    function displayWebCommand(array) {
        let data = JSON.parse(array), placeholder = document.querySelector("#WebTableData"), out = "";
        for (let i = 0; i < data.length; i++) {
            out += `<tr><td class="text-light">${i + 1}</td><td class="text-light">${data[i][1]}</td><td class="text-light">${data[i][2]}</td><td class="text-light"><button id="${data[i][0]}" onClick="WebDeleteID(this.id)" class="btn btn-sm btn-glow-red">Delete</button></td></tr>`;
        }
        placeholder.innerHTML = out;
    }

    $("#WebCommandAddBtn").click(function () {
        let key = $("#WebCommandKey").val(), value = $("#WebCommandValue").val();
        if (key.length > 0 && value.length) {
            eel.addWebCommand(key, value);
            swal({ title: "Updated Successfully", icon: "success" });
            eel.displayWebCommand()();
            $("#WebCommandKey").val(""); $("#WebCommandValue").val("");
        } else {
            const toast = new bootstrap.Toast(document.getElementById('liveToast'));
            $("#ToastMessage").text("All Fields Medatory"); toast.show();
        }
    });

    eel.expose(displayPhoneBookCommand);
    function displayPhoneBookCommand(array) {
        let data = JSON.parse(array), placeholder = document.querySelector("#ContactTableData"), out = "";
        for (let i = 0; i < data.length; i++) {
            out += `<tr><td class="text-light">${i + 1}</td><td class="text-light">${data[i][1]}</td><td class="text-light">${data[i][2]}</td><td class="text-light">${data[i][3]}</td><td class="text-light">${data[i][4]}</td><td class="text-light"><button id="${data[i][0]}" onClick="ContactDeleteID(this.id)" class="btn btn-sm btn-glow-red">Delete</button></td></tr>`;
        }
        placeholder.innerHTML = out;
    }

    $("#AddContactBtn").click(function () {
        let Name = $("#InputContactName").val(), MobileNo = $("#InputContactMobileNo").val();
        let Email = $("#InputContactEmail").val(), City = $("#InputContactCity").val();
        if (Name.length > 0 && MobileNo.length > 0) {
            if (Email.length < 0) Email = "";
            else if (City < 0) City = "";
            eel.InsertContacts(Name, MobileNo, Email, City);
            swal({ title: "Updated Successfully", icon: "success" });
            $("#InputContactName").val(""); $("#InputContactMobileNo").val("");
            $("#InputContactEmail").val(""); $("#InputContactCity").val("");
            eel.displayPhoneBookCommand()();
        } else {
            const toast = new bootstrap.Toast(document.getElementById('liveToast'));
            $("#ToastMessage").text("Name and Mobile number Madatory"); toast.show();
        }
    });
});

function SysDeleteID(clicked_id) { eel.deleteSysCommand(clicked_id); eel.displaySysCommand()(); }
function WebDeleteID(clicked_id) { eel.deleteWebCommand(clicked_id); eel.displayWebCommand()(); }
function ContactDeleteID(clicked_id) { eel.deletePhoneBookCommand(clicked_id); eel.displayPhoneBookCommand()(); }
