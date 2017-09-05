$(document).ready(function () {
    //Logic that is run when the Entity Form is loaded

    //Populate the Country and Post fields on the form
    var locationValue = $("#cap_location option").filter(function () { return this.value.toLowerCase() == g_countryid.toLowerCase(); }).val();
    var postValue = $("#cap_post option").filter(function () { return this.value.toLowerCase() == g_postid.toLowerCase(); }).val();

    //If Country and Post cannot be populated, show the error message and don't let the user continue
    if (!locationValue || !postValue) {
        $("#entityformerror").show();
        $("#entityform").hide();
    }

    //Add style to radio buttons
    $("#entityform .boolean-radio").addClass("inline");

    //Add new element surrounding the input and label with a class of multiple-choice, for styling
    $("#entityform .boolean-radio").each(function (index, booleanradio) {
        $(booleanradio).children("input").each(function (index2, input) {
            $(booleanradio).children("input[id='" + input.id + "'],label[for='" + input.id + "']").wrapAll("<div class='multiple-choice' />");
        });
    });

    //Set the Enquiry Title field and Original Enquiry field
    if ($("#cap_name").val().length < 1) { $("#cap_name").val(g_enquirytext); }
    $("#cap_originalenquiry").val(g_enquirytext);
    $("#cap_originalenquiry").prop("readonly", true);

    //Populate the Location fields
    $("#cap_location").val(locationValue);
    $("#cap_post").val(postValue);

    //Hide the fields that shouldn't be shown
    $("#cap_originalenquiry").closest(".control").hide();
    $("#cap_originalenquiry").closest(".control").prev(".info").hide();
    $("#cap_location").closest("tr").hide();
    $("#cap_post").closest("tr").hide();

    //Remove the default value for the Feedback radio buttons
    $("#cap_feedback input").attr("checked", false);

    //Hide the search topics fields
    $("*[id^='cap_searchtopic']").each(function (index, input) {
        $(input).closest("tr").hide();
    });

    //Add style to the Submit button
    $("#InsertButton").addClass("button");

    //Prevent server side length validation errors, newlines count for two characters on server side    
    $("#cap_enquirydetails").on("keyup change", function (event) {        
	var newlines = $(this).val().match(/[^\n]*\n[^\n]*/gi).length;        
	if ($(this).val() != "" && ($(this).val().length + newlines) > 1200) {            
	    $(this).val($(this).val().substring(0, 1200 - newlines));        
	}    
    });
});

if (window.jQuery) {
    (function ($) {
        //Add custom validation
        if (typeof (entityFormClientValidate) != 'undefined') {
            var originalValidationFunction = entityFormClientValidate;

            if (originalValidationFunction && typeof (originalValidationFunction) == "function") {
                entityFormClientValidate = function () {
                    //Run default client side validation
                    originalValidationFunction.apply(this, arguments);

                    if (Page_ClientValidate()) {
                        //If validation succeeds, run spam submission checks

                        //Check cookies are enabled
                        document.cookie = "testcookie";
                        var cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
                        if (!cookieEnabled) {
                            $("#cookiesubmissionerror").show();
                            return false;
                        }
                        //Check for spam submission cookie
                        if (document.cookie.indexOf("submission=") < 0) {
                            var d = new Date();
                            var expiration = (typeof g_spamsubmissiontimer !== 'undefined') ? g_spamsubmissiontimer * 1000 : 30000;
                            d.setTime(d.getTime() + expiration);
                            var expires = "expires=" + d.toUTCString();
                            document.cookie = "submission=true; " + expires + ";";

			    _paq.push(['trackEvent', 'click', 'EnquiryForm', 'Submission']);
                        }
                        else {
                            $("#spamsubmissionerror").show();
                            return false;
                        }
                    }
                    else {
                        //If client side validation fails

                        //Scroll the page to Validation summary
                        if ($(".validation-summary").length) {
                            $(".validation-summary").get(0).scrollIntoView();
                        }

                        //Logic for adding custom inline validation messages
                        var erroredControls = [];
                        for (var i = 0; i < Page_Validators.length; i++) {
                            //For each validator
                            var validator = Page_Validators[i];
                            //Check to make sure that this control has not already failed another validator
                            if ($.inArray(validator.controltovalidate, erroredControls) < 0) {
                                //Run validation function
                                if (!validator.evaluationfunction(validator)) {
                                    //If validation fails, render inline validation
                                    erroredControls.push(validator.controltovalidate);
                                    var input = $("#" + validator.controltovalidate);

                                    if (!input.hasClass("errored")) {
                                        input.addClass("errored");
                                        if (!input.hasClass("boolean-radio"))
                                            input.addClass("form-control-error");
                                        input.closest(".form-control-cell,.boolean-radio-cell").children().wrapAll("<div class='form-group-error'></div>");
                                        input.closest(".form-group-error").children(".info").append("<span class='error-message'>" + $(validator.errormessage).text() + "</span>");
                                    }
                                }
                                else {
                                    //If validation succeeds, remove inline validation elements and styles
                                    var input = $("#" + validator.controltovalidate);
                                    input.removeClass("errored");
                                    input.removeClass("form-control-error");
                                    var errorMessage = input.closest(".form-group-error").children(".info").children(".error-message");
                                    if (errorMessage) {
                                        errorMessage.remove();
                                    }
                                    if (input.closest(".form-group-error")) {
                                        var contents = input.closest(".form-group-error").contents();
                                        input.closest(".form-group-error").replaceWith(contents);
                                    }
                                }
                            }
                        }
                    }

                    return true;
                };
            }
        }
    }(window.jQuery));
}