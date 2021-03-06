$(document).ready( function() { 

    var searchedCompany = {};

            // See API Rate Limit
        function checkLimit() {
            $.ajax({
                dataType: "json",
                url: 'https://api.github.com/rate_limit',
                success: function(rateLimit) { 
                    console.log('API Call limit: ' + rateLimit.rate.limit);
                    console.log('API Calls Remaining: ' + rateLimit.rate.remaining);
                    console.log('API Usage will reset one hour after initial use');

                    if(rateLimit.rate.remaining == 0) {
                        $('#search-failed').hide();
                        $('#search-null').show();
                    }
            }})}

    // Search recommended company on click
    $('.recommended button').on('click', function(replaceSearch) {
        $('#companyName').val($(this).attr("value"));
        $('#companySearch').trigger("submit");
    });

    // Search entered company on click
    $('#companySearch').submit( function(event) {
        event.preventDefault();
        $('.loading').fadeIn();
        $('#repositories').empty();
        $('#page-tabs').empty();
        $('#current-company').empty();
        $('#search-empty').hide();
        $('#search-failed').hide();
        $('#search-null').hide();
        $('#current-company').hide();
        $('#repositories').hide();
        $('#page-tabs').hide();
        checkLimit();
        if($('#companyName').val().trim().length === 0) {
            // Show error if field empty
            $('.loading').hide();
            $('#search-empty').show();
            $('.search').addClass('search-error');
            setTimeout(function () { 
                $('.search').removeClass('search-error');
            }, 200);
            return
        } else {
            // Save searched company for later use
            searchedCompany.searchedCompany = $("#companyName").val();


            // Get Company Info
            $.ajax({
                dataType: "json",
                url: 'https://api.github.com/orgs/' + searchedCompany.searchedCompany + '/repos?per_page=100&page=1',
                success: function(getCompanyRepositories) { 
                    searchedCompany.companyAvatar = getCompanyRepositories[0].owner.avatar_url;
                    searchedCompany.companyName = getCompanyRepositories[0].owner.login;
                    searchedCompany.companyLink = getCompanyRepositories[0].owner.html_url;

                    // Append Company Card
                    $('#current-company').append(
                        '<img src="' + searchedCompany.companyAvatar + '" alt="profile picture">' +
                        '<h1>' + searchedCompany.companyName + '</h1>'+ 
                        '<a aria-label href="' + searchedCompany.companyLink + '" target="_blank"><i class="fa-brands fa-github-square"></i></a>');

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
                            '        </div>' +
                            '            <div class="view-commits">' +
                            '                <button class="view-commits-btn" value="' + repoName + '">View Commits</button>' +
                            '                <button class="toggle-commits-btn" value="' + repoName + '" style="display: none;">Hide Commits</button>' +
                            '                <ul class="repo-commits" style="display: none;"></ul>' +
                            '            </div>' +
                            '    </div>' +
                            '</li>');
                            setTimeout(function() {
                                $('.loading').hide();
                                $('#current-company').fadeIn();
                                $('#repositories').fadeIn();
                                $('#page-tabs').fadeIn();
                            }, 2000);
                            });
                            
                            
                            // Get Repository Commits On Click
                            $('.view-commits-btn').on('click', function(getCommits) {
                                checkLimit();
                                searchedCompany.searchedRepoCommits = $(this).val();
                                repoName = $(this).val();

                                //Swap view buttons to stop repeated api requests
                                $('.view-commits-btn[value=' + repoName +']').hide();
                                $('.toggle-commits-btn[value=' + repoName +']').show();

                                $.ajax({
                                    dataType: "json",
                                    url: 'https://api.github.com/repos/' + searchedCompany.searchedCompany + '/' + searchedCompany.searchedRepoCommits + '/commits?per_page=20',
                                    success: function(getRepoCommits) {

                                        $.each(getRepoCommits, function(i,e) {
                                        var commitMessage = getRepoCommits[i].commit.message;
                                        var commitAuthor = getRepoCommits[i].commit.author.name;
                                        var commitSha = getRepoCommits[i].parents[0].sha;
                                        var commitUrl = getRepoCommits[i].parents[0].html_url;
                                        var commitCreated = getRepoCommits[i].commit.committer.date;
                                        //Only return created date
                                        let commitDate = commitCreated.slice(0, 10);
                                        let commitHash = commitSha.slice(0, 7);
                                        let commitTitle = commitMessage.slice(0, 67);

                                        // Append each commit
                                        $('[value=' + repoName +']').next('ul').append(
                                            '<li>' +
                                            '   <div class="commit">' +
                                            '       <div class="commit-message">' +
                                            '           <span>' + commitTitle +'</span>' +
                                            '       </div>' +
                                            '       <div class="commit-info">' +
                                            '           <span class="commit-author">' + commitAuthor + '</span>' +
                                            '           <span class="commit-date">' + commitDate + '</span>' +
                                            '       </div>' +
                                            '   </div>' +
                                            '   <div class="commit-hash">' +
                                            '       <a aria-label="go to this commit" target="_blank" href="' + commitUrl + '"><span>' + commitHash + '</span></a>' +
                                            '   </div>' +
                                            '</li>')
                                            $('[value=' + repoName +']').next('ul').slideDown();
                                        });
                                }});

                                // Toggle view commit button
                                $('.toggle-commits-btn[value=' + repoName +']').on('click', function() {
                                    $('[value=' + repoName +']').next('ul').slideToggle();
                                    $(this).text($(this).text() == 'Hide Commits' ? 'View Commits' : 'Hide Commits');
                                });
                            });

                        // Sort repositories by star count, biggest to smallest
                        $(function() {
                            $("#repositories li").sort(sort_li).appendTo('#repositories');
                            function sort_li(a, b) {
                                return ($(b).data('position')) > ($(a).data('position')) ? 1 : -1;
                            }
                            pagnation()
                            });

                            // Form Pages To Prevent A Really Long Page
                            function pagnation() {
                                $('.repository-container');
                                var rowsShown = 5;
                                var rowsTotal = $('#repositories li').length;
                                var numPages = rowsTotal/rowsShown;
                                for(i = 0;i < numPages;i++) {
                                    var pageNum = i + 1;
                                    $('#page-tabs').append('<button href="#" rel="'+i+'">'+pageNum+'</button> ');
                                }
                                $('#repositories li').hide();
                                $('#repositories li').slice(0, rowsShown).show();
                                $('#page-tabs button:first').addClass('active');
                                $('#page-tabs button').bind('click', function(){
                                    $('#page-tabs button').removeClass('active');
                                    $(this).addClass('active');
                                    var currPage = $(this).attr('rel');
                                    var startItem = currPage * rowsShown;
                                    var endItem = startItem + rowsShown;
                                    $('#repositories li').css('opacity','0.0').hide().slice(startItem, endItem).
                                            css('display','flex').animate({opacity:1}, 400);
                                });
                                $('#page-tabs button:first').trigger("click");
                            }
                            
                },
                error: function() {
                    // Show error if company not found
                    checkLimit();
                    $('.loading').fadeOut();
                    $('#search-failed').show();
                    $('.search').addClass('search-error');
                    setTimeout(function () { 
                        $('.search').removeClass('search-error');
                    }, 200);
                }
            }); 
        }});
});