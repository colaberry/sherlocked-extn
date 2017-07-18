$(document).ready( function(){ 
var 
cacheSearches={},
cacheSaved={},
nomore = 0,
page = 0,
includeemail = true;
searching = 'li',
companies_ors='',
companies_ands='',
antikeywords = '',
reallocation = '',
count = 0,
arrUrl = [],
urlMap = {},
arrDivId = [],
TOKEN='',	

assign_handlers = function() {
	$('#clear-btn').click(clear_search);
	$('#save-btn').click(save_search);
	$('#load-btn').click(load_search);
	$('.modal-trigger').leanModal();
 	$(".button-collapse").sideNav();
	//$('#add-group').click(add_group);
	$(".andlabel").hide();
	$(".orlabel").hide();
	$(".antikeyword").hide();
	$('body').on('click tap','.populate-search',function(){
		var clickedBtnID = $(this).attr('id');
		populate_search(clickedBtnID);
	});
	$('body').on('click tap','.load-more',function(){
		do_load_more();
	});
	$('body').on('click tap','#search',function(){
		nomore=0;
		page = 0;
		if ((companies_ors!=='')||(companies_ands!=='')||($('#location').val()!=='')||($('#anti-skills').val()!=='')){
			run_search_query($('.tabs.active'));
		}
	});
	$('body').on('click tap','.tab',function(){
		nomore=0;
		page = 0;
		if ((companies_ors!=='')||(companies_ands!=='')||($('#location').val()!=='')||($('#anti-skills').val()!=='')){
			run_search_query($('.tabs.active'));
		}
	});

	$('body').on('keypress','.keywords_group',function(e){
		 var p = e.which;
		 if ($('.keywords_group').val()!==''){
		     if(p==63){
		     	 if(companies_ors==''){
		     	 	companies_ors+='(';
		     	 }else{
		     	 	companies_ors = companies_ors.slice(0, -1);
		     	 	companies_ors+=' + OR + ';
		     	 }
		   	 	 companies_ors +=  '"'+$(this).val()+'"';
		   	 	 $(".orlabel").show();
		   	 	 $(this).parent().parent().find('.orcontainer').append('<div class="theTag OR  chip teal darken-1"><span class="value">'+$(this).val()+'</span><i class="material-icons">close</i></div>');
		     	 $(this).val("");
				 if (companies_ors.indexOf(') ') != -1) {
					companies_ors = companies_ors.replace(')', "");
				 }
  				companies_ors += ") ";
		     	 e.preventDefault();
		     }
	 	     if(p==47){
		     	 companies_ands +=  '"'+$(this).val()+'"+';
		     	 $(".andlabel").show();
		         $(this).parent().parent().find('.andcontainer').append('<div class="theTag AND chip blue darken-2"><span class="value">'+$(this).val()+'</span><i class="material-icons">close</i></div>');
		     	 $(this).val("");
		     	 e.preventDefault();
		     }
		 }
	});

	$('body').on('keypress','.anti-skills',function(e){
		 var p = e.which;
		 if ($('.anti-skills').val()!==''){
	 	     if(p==13){
		     	 antikeywords +=  '-"'+$(this).val()+'"+';
		     	 $(".antikeyword").show();
		         $(this).parent().parent().find('.antikeyword').append('<div class="theTag ANTI chip red darken-2"><span class="value">'+$(this).val()+'</span><i class="material-icons">close</i></div>');
		     	 $(this).val("");
		     	 e.preventDefault();
		     }
		 }
	});

	$('body').on('click tap','.theTag',function(){
		var value = $(this).find(".value").html();
		if ($(this).hasClass('AND')){
			companies_ands = companies_ands.replace('"'+value+'"+', "");
			if (companies_ands == ''){
				$(".andlabel").hide();
			}		
		}else if($(this).hasClass('OR')) {
			//companies_ors = companies_ors.replace('"'+value+'"+OR+', "");
			var temp = companies_ors;
			companies_ors = companies_ors.replace(' + OR + "'+value+'"', "");
			if (companies_ors === temp){
				companies_ors = companies_ors.replace('("'+value+'") ', "");
				if (companies_ors === temp){
					companies_ors = companies_ors.replace('("'+value+'" + OR + ', "(");
				}
			}
			if (companies_ors == ''){
				$(".orlabel").hide();
			}
		}else if($(this).hasClass('ANTI')){
			antikeywords = antikeywords.replace('-"'+value+'"+', "");
			if (antikeywords == ''){
				$(".antikeyword").hide();
			}		
		}
		$(this).remove();
	})
},

clear_search = function(){
	companies_ands = '';
	companies_ors = '';	
	antikeywords = '';
	$('#companies_group .tag').remove();
	$('#companies').val("");
	$('#anti-skills_group .tag').remove();
	$('#anti-skills').val("");
	$('#skills_group .tag').remove();
	$('#skills').val("");
	$('#group_0').val("");
	$('#location').val("");
	$('#job-title').val("");
	$('.theTag').remove();
	$(".andlabel").hide();
	$(".orlabel").hide();
	$(".antikeyword").hide();
},

add_group = function(){
	//$('.group_keyword').append('<br><div><input type="text" class="keywords_group" id="group_0" /></div>');
}

highlight_search=function(){
	//if ($('#highlight_checkbox').is(':checked')){
			$("b").each(function() {
				if (($(this).html()!="...")&&($(this).html().toLowerCase()!="website")&&
					($(this).html().toLowerCase()!="joined on")&& ($(this).html().toLowerCase()!="members") &&
					($(this).html().toLowerCase()!="site")){
						$(this).css( "background-color", "#FFFF00" );
				}
			});
	//	} else {
	//		$("b").each(function() {
	//			$(this).css( "background-color", "transparent" );
	//		});
	//	  }
},

run_search_query = function(socialsearch) {
	searching = socialsearch.data('id');
	run_search_ajax();
	//getAllEmails(0);
},	


create_search_url = function ( $type ) {
	reallocation = $('#location').val();
	//var location = $('#location').val();
	// google-specifc search 
	if (searching === 'gp'){
		reallocation = 'lives * ' + reallocation;
	}

	var query_vars = '',
		qstr = '';
		//anti_vars='';
		//skills_vars='(',
		//companies_vars='(';
	if (companies_ands!==''){
		query_vars +=companies_ands
	}
	if (includeemail == true){
	//	query_vars += '+"@gmail"'
	}
	if ((companies_ands!=='')&&(companies_ors!=='')){
		query_vars +='+';
	}
	if (companies_ors!==''){
		query_vars +=companies_ors
	}
	if ((companies_ors!=='')&&(antikeywords!=='')){
		query_vars +='+';
	}
	if (antikeywords!==''){
		query_vars +=antikeywords;
	}
	if (reallocation!==''){
		query_vars += '"'+reallocation+'"';
	}
	query_vars = query_vars.replace(/%20/g, '+');
	query_vars = encodeURI(query_vars);
	//query_vars = query_vars.replace(/\+/g, '%2B');
	switch ( $type ) {
		case 'li':
			qstr = query_vars+'-inurl:"dir/ " -intitle:"profiles"+(site:www.linkedin.com/in/ OR site:www.linkedin.com/pub/)';
			break;
		case 'gp':
			qstr = 'site:plus.google.com+'+query_vars+'inurl:about';
			break;
		case 'gh':
			qstr = 'site:github.com "joined on" -intitle:"at master" -inurl:"tab" -inurl:"jobs." -inurl:"articles" ' + query_vars;
			break;
		case 'so':
			qstr = query_vars+'+site:stackoverflow.com/users+'+'intext:"website * *(com|net|me)"-"0 reputation"';
			break;
		case 'in':
			qstr = query_vars+'+site:www.indeed.com/r/+'+' "Updated: * 2015"';
			break;
		case 'tw':
			qstr = 'site:twitter.com -inurl:(search|favorites|status|statuses|jobs) -intitle:(job|jobs) -recruiter -HR -careers' + query_vars;
			break;
		case 'dr':
			qstr = 'site:dribbble.com -inurl:(followers|type|members|following|jobs|designers|players|buckets|places|skills|projects|tags|search|stories|users|draftees|likes|lists) -intitle:(following|likes) -"Hire Us" ' + query_vars;
			break;
	}
	qstr += ((page !== 0)? '&start='+(page * 10) : '');
	return qstr;
},


run_search_ajax = function() {
		var search_str = create_search_url(  searching );
		//	search_str = search_str.replace(/%2C/g,' ');
     	var dirrecion = encodeURI(search_str);
     		dirrecion = dirrecion.replace(/%20/g, '+');
			dirrecion = dirrecion.replace(/%25/g,'%');
			dirrecion = dirrecion.replace(/\//g,'%2F');
			$('.load-more').prop("disabled", true);
			$.ajax({
				url:"https://sherlockedstg.herokuapp.com/server",
				dataType:"json",
				type: "POST",
				data: {'direccion':dirrecion},
			    success: function (returned) {
			    	$(".alertmessage").remove();
	    			if (typeof returned.items === 'undefined') {
						var no_res = '<strong class="alertmessage" style="font-size: 18px; display:block; '+
										'text-align:center">Sorry my dear Watson this investigation got us no where</strong>';
						
						var no_res1 = '<strong class="alertmessage" style="font-size: 18px; display:block; '+
										'text-align:center">This is all we found Watson</strong>';
						if (page == 0) {
							$('.the-results').html( no_res );
							$('.the-results').addClass("col m12 row white radius padded")
						} else {
							$('.load-more').parent().before( no_res1 );
							$('.load-more').hide();
						}
						return false;
					}
					var result_set = create_result_view( returned.items, returned.searchInformation.totalResults );
					
					if (page == 0) {
						$('.the-results').html( result_set );
						$('.the-results').addClass("col m12 row white radius padded")
						if (returned.queries.nextPage === undefined){
							nomore=1;
						}
					}else {
						if (nomore == 0){
							$('.load-more').parent().before( result_set );
						}
						else{
							$('.load-more').hide();
							$('.load-more').parent().before( no_res1 );
						}
						if (returned.queries.nextPage == undefined){
							nomore=1;
						}
					}
					$('.load-more').prop("disabled", false);
					highlight_search();
					if (searching == 'gh')
						set_listener_handler(page);
				}
			});
},

do_load_more = function() {
	page = page + 1;
	run_search_ajax();

},
	
create_result_view = function ( data, total ) {

	var search_name = '',
		title_rep = '';
	switch( searching ) {
		case 'li':
			search_name = 'LinkedIn';
			title_rep = ' | LinkedIn';
			break;
		case 'gp':
			search_name = 'Google+';
			title_rep = ' - About - Google+';
			break;
		case 'gh':
			search_name = 'GitHub';
			title_rep = ' · GitHub';
			break;
		case 'so':
			search_name = 'StackOverflow';
			title_rep = /^User\s|\s-\sStack\sOverflow/g;
			break;
		case 'in':
			search_name = 'Indeed';
			title_rep = ' | Indeed';
			break;
		case 'tw':
			search_name = 'Twitter';
			title_rep = ' | Twitter';
			break;
		case 'dr':
			search_name = 'Dribbble';
			title_rep = ' | Dribbble';
			break;
	}

	var html = '';
	if (page === 0) {
		html += '<div class="searchResults" style="color: #999"> Elementary dear Watson Approximately '+total+' candidates is what we found from '+search_name+'</div><hr style="border-top: 1px solid #ccc;">';
	} else {
		html += '<div class="searchResults" style="color: #999"><br>Page '+(page+1)+'</div><hr style="border-top: 1px solid #ccc;">';
	}
	count = 0;
	arrUrl[page] = [];
	$.each( data, function( key, val ) {
		count++;
		arrUrl[page][count] = val.link;
		html += '<div class="result-row" style="padding-bottom: 12px;">';
		html += '<div class="resdata">';
		html += '<strong><a href="'+val.link+'" target="_blank">'+val.title.replace( title_rep, '')+'</a></strong><br>';
		if (searching == 'gh') {
			html += '<div id="email_'+ page + '_'+ count +'" p="'+ page +'" c="'+ count +'"><b  class="theTag OR  chip teal darken-1">Get Email</b></div>';
			arrUrl.push(val.link);
			arrDivId.push("email_" + page + "_" + count);
			urlMap["email_" + page + "_" + count] = val.link;
		}
		if (typeof val.pagemap !== 'undefined') {
			if (typeof val.pagemap.person !== 'undefined') {
				if (typeof val.pagemap.person[0] !== 'undefined') {
					html += '<div style="color: #999">';
					if (typeof val.pagemap.person[0].role !== 'undefined') html += val.pagemap.person[0].role;
					if (typeof val.pagemap.person[0].role !== 'undefined' && typeof val.pagemap.person[0].location !== 'undefined') {
						html += ' - ';
					}
					if (typeof val.pagemap.person[0].location !== 'undefined') html += val.pagemap.person[0].location;
					html += '</div>';
					 
				}
			}
		}

		html += val.htmlSnippet+'<br>';
		html += '</div></div>';
	});

	if (page === 0) {
		html += '<div style="text-align:center"><br><button class="waves-effect waves-light btn load-more">Load more</button></div>';
	}
	
	return html;
},



save_search = function(){
	var reallocation = $('#location').val();
	var keywordsands = companies_ands.replace(/\"/g, '');
		keywordsands = keywordsands.replace(/\+/g,',');
	var keywordsors = companies_ors.replace(/\"/g, '');
		keywordsors = keywordsors.replace(/\+OR\+/g,',');
		keywordsors = keywordsors.replace(/\(/g,'');
		keywordsors = keywordsors.replace(/\)/g,'');
	var antikeywordssan = antikeywords.replace(/\"/g, '');
		antikeywordssan = antikeywordssan.replace(/\-/g, '');
		antikeywordssan = antikeywordssan.replace(/\+/g,',');
	var userid = $('#userid').val();
	var searchname = $('#search-name').val();
		$.ajax({
			url:"http://sherlock-ed.co/save",
			dataType:"json",
			type: "POST",
			data: {'searchname':searchname,'userid':userid,'saveQuery':true,'location':reallocation,'keywordsands':keywordsands,'keywordsors':keywordsors,'antikeywords':antikeywordssan,'website':searching},
		    success: function (returned) {

			}
		});
},
load_search = function(){
	var userid = $('#userid').val();
	$.ajax({
			url:"http://sherlock-ed.co/save",
			dataType:"json",
			type: "POST",
			data: {'userid':userid,'loadQuery':true},
		    success: function (returned) {
		    	cacheSaved = returned;
		    	var result_set = '';
		    	var socialmedia = '';
		    	$.each(returned,function(key,value){
		    		socialmedia = '';
		    		if (value.website == 'li'){
			        	socialmedia = '<i class="fa fa-linkedin-square" aria-hidden="true"></i>';
			        }else if(value.website == 'gp'){
			        	socialmedia = '<i class="fa fa-google-plus-square" aria-hidden="true"></i>';
			        }else if(value.website == 'gh'){
			        	socialmedia = '<i class="fa fa-github-square" aria-hidden="true"></i>';
			        }else if(value.website == 'so'){
			        	socialmedia = '<i class="fa fa-stack-overflow" aria-hidden="true"></i>';
			        }else if(value.website == 'tw'){
			        	socialmedia = '<i class="fa fa-twitter" aria-hidden="true"></i>';
			        }
		    		result_set += '<li id="index'+key+'" class="collection-item avatar populate-search"> <a href="#!"> <i class="fa fa-folder-open-o circle green" aria-hidden="true"></i>';
			        result_set += '<span class="title">'+socialmedia+ " " +value.name+'</span>'  
			    })
		    	$('.load-search-result').html( result_set );
		    	$('#saveSearches').closeModal();
			}
		});
},
populate_search = function(id){
	clear_search();
	var indexid = id.replace('index',''),
		savedSearch = cacheSaved[indexid],
		tempors = savedSearch['keywordsors'],
		tempands = savedSearch['keywordsands'],
		tempanti = savedSearch['antikeywords'];

		tempands = tempands.replace(/,\s*$/, "");
		tempors = tempors.replace(/,\s*$/, "");
		tempanti = tempanti.replace(/,\s*$/, "");

		var temporsarray = [],
			tempandsarray = [],
			tempantiarray = [];

		if (tempors != ''){
			temporsarray = tempors.split(',');
		}
		if (tempands != ''){
			tempandsarray = tempands.split(',');
		}

		if (tempanti != ''){
			tempantiarray = tempanti.split(',');
		}
	
		tempors = '("' + tempors;
		tempands = '"' + tempands;
		tempanti = '-"' + tempanti;

		tempands = tempands.replace(/,/g, '"+"');
		tempands += '"';

		tempors = tempors.replace(/,/g,'+OR+');
		tempors += '")';
	
		tempanti = tempanti.replace(/,/g,'"+-"');
		tempanti += '"';

	
		if ( tempors == '("")'){
			tempors = '';
		}
		if(tempands == '""'){
			tempands = '';
		}
		if(tempanti == '-""'){
			tempanti = '';
		}

	
		searching = savedSearch['website'];
		reallocation = savedSearch['location'];
		$('#location').val(reallocation);
		$('#social'+searching).click();
		companies_ors = tempors;
		companies_ands =tempands+'+';
		antikeywords = tempanti+'+';

		$.each(tempandsarray,function(key,value){
			$(".andlabel").show();
			$('.andcontainer').append('<div class="theTag AND chip blue darken-2"><span class="value">'+value+'</span><i class="material-icons">close</i></div>');
		})

		$.each(temporsarray,function(key,value){
			$(".orlabel").show();
			$('.orcontainer').append('<div class="theTag OR  chip teal darken-1"><span class="value">'+value+'</span><i class="material-icons">close</i></div>');
		})

		$.each(tempantiarray,function(key,value){
			$(".antikeyword").show();
			$('.antikeyword').append('<div class="theTag ANTI chip red darken-2"><span class="value">'+value+'</span><i class="material-icons">close</i></div>');
		})

		 $('#loadSearches').closeModal();
		 $('#search').click();
};

assign_handlers();

});


	function getAllEmails(page) {
		var arrCount = $(arrUrl).size();
					console.log("IN Get Email -page::" + page);

		for (i=page*10; i < arrCount; i++) {
			var url = arrUrl[i];
			var divId = arrDivId[i];
			var res = url.split("?");
			var user_part = res[0].substr(19);
			var userRes = user_part.split("/");
			var user = userRes[0];
			console.log("User from URL is :" + user);
			console.log("Div ID ::" + divId);
			var email = 'mani@filtered.ai';
				var user_name = user;
				var repo_name = getGitRepoList(user_name);
				urlGit = "https://github.com/";
				if (url.indexOf(urlGit) != -1) {
					url = urlGit + user_name + "/";
					url = url + repo_name + "/commit/master.patch";
					if(url.match('^http')){
					  //url = 'proxy.php?url=' + url;
					}

					email = getMasterPatchText(url);
				}
			var emailElement = document.getElementById(divId);
			document.getElementById(divId).innerHTML = "<b>"+ email + "</b>";
		}
    }

	function getEachEmail(url, divId) {
		console.log("IN Get Each Email - " + divId);

		var res = url.split("?");
		var user_part = res[0].substr(19);
		var userRes = user_part.split("/");
		var user = userRes[0];
		console.log("User from URL is :" + user);
		console.log("Div ID ::" + divId);
		var email = 'mani@filtered.ai';
			var user_name = user;
			
			var repo_name = "";

//Getting Repo name
		var apiUrl = 'https://api.github.com/users/' + user_name + '/repos' + "?access_token=<TOKEN>";

		$.ajax({
			url:apiUrl,
			dataType:"json",
			type: "GET",
			data: {},
		    success: function (returned) {
				console.log(returned);
				var repoList = "";
		    	$.each(returned,function(key,value){
					var repoName = value.name;
					var repoUrl = value.url;
					var repoFork = value.fork;
					if(	!repoFork) {
						console.log(repoName + " URL is " + repoUrl + " Forked is:" + repoFork);
						repo_name = repoName;
						//break;
					}
				});

				if (repo_name) {
					var urlPatch = '';
					urlGit = "https://github.com/";
					if (url.indexOf(urlGit) != -1) {
						urlPatch = urlGit + user_name + "/";
						urlPatch = urlPatch + repo_name + "/commit/master.patch";
						if(urlPatch.match('^http')){
						  //urlPatch = 'proxy.php?url=' + urlPatch;
							fetchEmail(urlPatch,divId);
						}
						
					}
				} else {
					var emailElement = document.getElementById(divId);
					if (emailElement != null)
						document.getElementById(divId).innerHTML = "";

				}
			},
			error : function (err) {
				console.log("Error accessing URL :: " + err);
				var emailElement = document.getElementById(divId);
				if (emailElement != null)
					document.getElementById(divId).innerHTML = "";
			}
		});
	
    }
	
    function getGitRepoList(user) {
		var url = 'https://api.github.com/users/' + user + '/repos';
		var req = new XMLHttpRequest();  
		req.open('GET', url, false);   
		req.send(null);  
		if(req.status == 200)  
		{
			  var repoList = JSON.parse(req.responseText);
			  
			  
			  for (repo in repoList) {
				 var repoName = repoList[repo].name;
				var repoUrl = repoList[repo].url;
				var repoFork = repoList[repo].fork;
			  
				if(	!repoFork) {
					console.log(repoName + " URL is " + repoUrl + " Forked is:" + repoFork);
					return repoName;
				}
			}
		}
	}

	


	  function clickGetEmail(link) {
		  
		var url = urlMap[link.id] ;
		getEachEmail(url, link.id);
	  }
	  
	  function fetchEmail(url,divId) {

		function setEmailText() {
			email = this.responseText;
			var patt1 = /[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})/ig;
			var result = email.match(patt1);
			if (!result || result == 'null') {
				result = "Oops! Could not find the email address matching this profile."
			} else {
				result = result[0];
			}
			var emailElement = document.getElementById(divId);
			if (emailElement != null)
			document.getElementById(divId).innerHTML = "<b>"+ result + "</b>";

		}
		var request = new XMLHttpRequest();
		request.onload = setEmailText;
		request.open('get', url, true)
		request.send()
				
	  }
	  
	  function getMasterPatchText(url) {
		
		var req = new XMLHttpRequest();  
		req.open('GET', url, false);   
		req.send(null);  
		if(req.status == 200)  
		   return(req.responseText);
		
	  }

  // filter out some nasties
  function filterData(data){
    data = data.replace(/<?\/body[^>]*>/g,'');
    data = data.replace(/[\r|\n]+/g,'');
    data = data.replace(/<--[\S\s]*?-->/g,'');
    data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
    data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
    data = data.replace(/<script.*\/>/,'');
    return data;
  }
  
  function set_listener_handler(pageNo) {
	for (j=1;j<=10; j++){
		var link = document.getElementById('email_' + pageNo + '_' + j);
		// onClick's logic below:
		link.addEventListener('click', function() {
			clickGetEmail(this);
		});
	}
}

  
  $(document).ready(function(){
});