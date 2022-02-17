$(document).ready( function() { 

    $('#search-empty').hide();
    $('#search-failed').hide();

    var searchedCompany = {};

    $.ajax({
        dataType: "json",
        url: 'https://api.github.com/rate_limit',
        success: function(rateLimit) { 
            console.log(rateLimit);
        }});

    // Search recommended company on click
    $('.recommended button').on('click', function(replaceSearch) {
        $('#companyName').val($(this).attr("value"));
        $('#companySearch').trigger("submit");
    });

    // Search entered company on click
    $('#companySearch').submit( function(event) {
        event.preventDefault();
        $('#repositories').empty();
        $('#search-empty').hide();
        $('#search-failed').hide();
        if($('#companyName').val().trim().length === 0) {
            // Show error if field empty
            $('#search-empty').show();
            return
        } else {
            // Save searched company for later use
            searchedCompany.searchedCompany = $("#companyName").val();


            // Get Company Info
            $.ajax({
                dataType: "json",
                url: 'https://api.github.com/orgs/' + searchedCompany.searchedCompany + '/repos?per_page=50',
                success: function(getCompanyRepositories) { 
                    searchedCompany.companyAvatar = getCompanyRepositories[0].owner.avatar_url;
                    searchedCompany.companyName = getCompanyRepositories[0].owner.login;

                    // Start pulling repositories 
                    $.each(getCompanyRepositories, function(i,e) {
                        var self = this;

                        var repoName = getCompanyRepositories[i].name;
                        var repoLanguage = getCompanyRepositories[i].language;
                        var repoDescription = getCompanyRepositories[i].description;
                        var repoStarCount = getCompanyRepositories[i].stargazers_count;
                        var repoForkCount = getCompanyRepositories[i].forks;
                        var repoCreation = getCompanyRepositories[i].created_at;
                        
                        // Only return created date
                        let repoDate = repoCreation.slice(0, 10);

                        // Append each repository in it's own card
                        $('#repositories').append(
                            '<li style="display: none;" class="repository-card" data-position="' + repoStarCount + '">' +
                            '    <div class="repo-details">' +
                            '        <div class="repo-info">' +
                            '            <h2 class="repository">' + repoName + '</h2>' +
                            '            <span class="date">' + repoDate + '</span>' +
                            '        </div>' +
                            '        <p class="description">' + repoDescription + '</p>' +
                            '        <div class="repo-bottom">' +
                            '            <div class="stats">' +
                            '                <div class="stars"><i class="fa-solid fa-star"></i> <span>' + repoStarCount + '</span></div>' +
                            '                <div class="forks"><i class="fa-solid fa-code-fork"></i></i> <span>' + repoForkCount + '</span></div>' +
                            '                <div class="languages"><span><i class="fa-solid fa-circle"></i> ' + repoLanguage + '</span>' + '</div>' +
                            '            </div>' +
                            '            <div class="view-commits">' +
                            '                <button class="view-commits-btn" value="' + repoName + '">View Commits</button>' +
                            '                <ul class="repo-commits"></ul>' +
                            '            </div>' +
                            '        </div>' +
                            '    </div>' +
                            '</li>');

                            });

                            $('.view-commits-btn').on('click', function(getCommits) {
                                searchedCompany.searchedRepoCommits = $(this).val();
                                repoName = $(this).val();
                                console.log(searchedCompany.searchedRepoCommits);

                                $.ajax({
                                    dataType: "json",
                                    url: 'https://api.github.com/repos/' + searchedCompany.searchedCompany + '/' + searchedCompany.searchedRepoCommits + '/commits',
                                    success: function(getRepoCommits) {
                                        console.log(getRepoCommits);

                                        $.each(getRepoCommits, function(i,e) {
                                        var commitTitle = getRepoCommits[i].commit.message;
                                        var commitAuthor = getRepoCommits[i].commit.author.name;
                                        var commitSha = getRepoCommits[i].sha;
                                        var commitCreated = getRepoCommits[i].commit.committer.date;
                                        console.log(commitTitle);
                                        console.log(commitAuthor);
                                        console.log(commitHash);
                                        console.log(commitCreated);
                                        //Only return created date
                                        let commitDate = commitCreated.slice(0, 10);
                                        let commitHash = commitSha.slice(0, 7);

                                        $('[value=' + repoName +']').next('ul').append(
                                            '<li>' + commitTitle + ' | ' + commitAuthor + ' | ' + commitHash + ' | ' + commitDate + '</li>'
                                        )
                                        console.log(getRepoCommits);
                                        });
                                }});
                            });

                        // Sort repositories by star count, biggest to smallest
                        $(function() {
                            $("#repositories li").sort(sort_li).appendTo('#repositories');
                            function sort_li(a, b) {
                                return ($(b).data('position')) > ($(a).data('position')) ? 1 : -1;
                            }
                            });
                            $("#repositories li").show();

                },
                error: function() {
                    // Show error if company not found
                    $('#search-failed').show();
                }
            }); 
        }});
});