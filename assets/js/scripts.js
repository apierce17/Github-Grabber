$(document).ready( function() { 


    var searchedCompany = {};

    $('#searchCompany').on('click', function(event) {
        event.preventDefault();
        $('#repositories').empty();
        if($('#companyName').val().trim().length === 0) {
            // Throw error if field empty
            console.log('sadad')
            return
        } else {
            // Save searched company for later use
            searchedCompany.searchedCompany = $("#companyName").val();

            // Get Company Info
            $.ajax({
                dataType: "json",
                url: 'https://api.github.com/orgs/' + searchedCompany.searchedCompany + '/repos?per_page=10',
                success: function(getCompanyRepositories) { 
                    searchedCompany.companyAvatar = getCompanyRepositories[0].owner.avatar_url;
                    searchedCompany.companyName = getCompanyRepositories[0].owner.login;
                    console.log(getCompanyRepositories);

                    // Start pulling repositories 
                    $.each(getCompanyRepositories, function(i,e) {
                        var repoName = getCompanyRepositories[i].name;
                        var repoLanguage = getCompanyRepositories[i].languages_url;
                        var repoDescription = getCompanyRepositories[i].description;
                        var repoStarCount = getCompanyRepositories[i].stargazers_count;
                        var repoForkCount = getCompanyRepositories[i].forks;
                        var repoCreation = getCompanyRepositories[i].created_at;
                        
                        // Append each repository in it's own card
                        $('#repositories').append(
                            '<li style="display: none;" class="repository-card" data-position="' + repoStarCount + '">' +
                            '    <div class="repo-details">' +
                            '        <div class="repo-info">' +
                            '            <h2 class="repository">' + repoName + '</h2>' +
                            '            <span class="date">' + repoCreation + '</span>' +
                            '        </div>' +
                            '        <p class="description">' + repoDescription + '</p>' +
                            '        <div class="repo-bottom">' +
                            '            <div class="stats">' +
                            '                <div class="stars"><i class="fa-solid fa-star"></i> <span>' + repoStarCount + '</span></div>' +
                            '                <div class="forks"><i class="fa-solid fa-code-fork"></i></i> <span>' + repoForkCount + '</span></div>' +
                            '            </div>' +
                            '            <div class="languages">' +
                            '                <span>' + repoLanguage + '</span>' +
                            '            </div>' +
                            '            <div class="view-commits">' +
                            '                <button class="view-commits-btn">View Commits</button>' +
                            '            </div>' +
                            '        </div>' +
                            '    </div>' +
                            '</li>');
                                        });

                        // Sort repositories by star count, biggest to smallest
                        $(function() {
                            $("#repositories li").sort(sort_li).appendTo('#repositories');
                            function sort_li(a, b) {
                                return ($(b).data('position')) > ($(a).data('position')) ? 1 : -1;
                            }
                            });
                            console.log('asdasdasdsadsa');
                            $("#repositories li").show();

                }});


                
        }});

        
});