$(document).ready( function() { 

    $('#search-empty').hide();
    $('#search-failed').hide();
    $('.repo-commits').hide();
    $('#current-company').hide();
    

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
        $('#page-tabs').empty();
        $('#current-company').empty();
        $('#search-empty').hide();
        $('#search-failed').hide();
        $('#current-company').hide();
        if($('#companyName').val().trim().length === 0) {
            // Show error if field empty
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
                url: 'https://api.github.com/orgs/' + searchedCompany.searchedCompany + '/repos?per_page=100&page=2',
                success: function(getCompanyRepositories) { 
                    searchedCompany.companyAvatar = getCompanyRepositories[0].owner.avatar_url;
                    searchedCompany.companyName = getCompanyRepositories[0].owner.login;
                    searchedCompany.companyLink = getCompanyRepositories[0].owner.html_url;

                    $('#current-company').append(
                        '<img src="' + searchedCompany.companyAvatar + '" alt="profile picture">' +
                        '<h1>' + searchedCompany.companyName + '</h1>'+ 
                        '<a aria-label href="' + searchedCompany.companyLink + '" target="_blank"><i class="fa-brands fa-github-square"></i></a>');
                    $('#current-company').show();
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

                        // Append company card
                        

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

                            });
                            
                            

                            $('.view-commits-btn').on('click', function(getCommits) {
                                searchedCompany.searchedRepoCommits = $(this).val();
                                repoName = $(this).val();
                                $('.view-commits-btn[value=' + repoName +']').hide();
                                $('.toggle-commits-btn[value=' + repoName +']').show();

                                $.ajax({
                                    dataType: "json",
                                    url: 'https://api.github.com/repos/' + searchedCompany.searchedCompany + '/' + searchedCompany.searchedRepoCommits + '/commits',
                                    success: function(getRepoCommits) {
                                        console.log(getRepoCommits);

                                        $.each(getRepoCommits, function(i,e) {
                                        var commitMessage = getRepoCommits[i].commit.message;
                                        var commitAuthor = getRepoCommits[i].author.login;
                                        var commitSha = getRepoCommits[i].parents[0].sha;
                                        var commitUrl = getRepoCommits[i].parents[0].html_url;
                                        var commitCreated = getRepoCommits[i].commit.committer.date;
                                        //Only return created date
                                        let commitDate = commitCreated.slice(0, 10);
                                        let commitHash = commitSha.slice(0, 7);
                                        let commitTitle = commitMessage.slice(0, 67);

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
                                        console.log(getRepoCommits);
                                        });
                                }});

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
                            function pagnation() {
                                $('.repository-container').after('<ul id="repositories"></ul>');
                                var rowsShown = 5;
                                var rowsTotal = $('#repositories li').length;
                                var numPages = rowsTotal/rowsShown;
                                console.log(rowsTotal);
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
                                            css('display','flex').animate({opacity:1}, 300);
                                });
                                $('#page-tabs button:first').trigger("click");
                            }
                            
                },
                error: function() {
                    // Show error if company not found
                    $('#search-failed').show();
                    $('.search').addClass('search-error');
                    setTimeout(function () { 
                        $('.search').removeClass('search-error');
                    }, 200);
                }
            }); 
        }});
});