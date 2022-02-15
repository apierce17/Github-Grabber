$(document).ready( function() { 

    $.ajax({
        dataType: "json",
        url: 'https://api.github.com/orgs/Netflix/repos',
        success: function(repo) { 
            console.log(repo);
        }});


});