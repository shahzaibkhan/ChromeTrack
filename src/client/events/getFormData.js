var port = chrome.runtime.connect({name: 'formData'});

// On form submit:
$('form').submit(function (event) {
    var formDataArray = [];
    // Iterate through form elements on page:
    $('form').each(function (i) {
        var formData = {};
        formData.url = $(location).attr('href');
        formData.action = $('form')[i].action;
        formData.method = $('form')[i].method;
        formData.id = $('form')[i].id;
        formData.data = $($('form')[i]).serialize();
        // Append this form's data to formDataArray.
        formDataArray.push(formData);
    });
    port.postMessage(formDataArray);
});
