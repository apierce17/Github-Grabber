$(document).ready( function() { 
    // Delete Later
    $('#companyName').val('Netflix');

    var searchedCompany = {};
    var searchedCompanyRepos = {};


    $('#searchCompany').on('click', function(event) {
        event.preventDefault();
        if($('#companyName').val().trim().length === 0) {
            // Throw error if field empty
            console.log('sadad')
            return
        } else {
            // Save searched company for later use
            searchedCompany.searchedCompany = $("#companyName").val();
            console.log(searchedCompany.searchedCompany);

            // Get Company Info
        $.ajax({
            dataType: "json",
            url: 'https://api.github.com/orgs/' + searchedCompany.searchedCompany + '/repos',
            success: function(getCompany) { 
                searchedCompany.companyAvatar = getCompany[0].owner.avatar_url;
                searchedCompany.companyName = getCompany[0].owner.login;
                console.log(getCompany);
            }});
        }});

    
});