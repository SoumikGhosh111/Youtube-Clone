let cookieString = document.cookie;

let videoId =  cookieString.split("=")[1];
// const apiKey = localStorage.getItem("api_key"); 
const apikey = "AIzaSyAfgUa4P7751n20O113zUKmIPsoojoanrQ"; 
// key 1... AIzaSyB-xjG2MYpMlIQlONUe_Vm75Ix2JAg_B7s
// key 2... AIzaSyAfgUa4P7751n20O113zUKmIPsoojoanrQ

let firstScript = document.getElementsByTagName("script")[0] ;

firstScript.addEventListener("load", onLoadScript)

function onLoadScript() {
  if (YT) {
    new YT.Player("player", {
      height: "600",
      width: "1050",
      videoId,
      events: {
        onReady: (event) => {
            document.title = event.target.videoTitle ;
            extractVideoDetails(videoId);
            fetchStats(videoId)
        }
      }
    });
  }
}

const statsContainer = document.getElementsByClassName("video-details")[0] ;

async function extractVideoDetails(videoId){ 
    let endpoint = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apikey}`;

    try {
        let response = await fetch(endpoint);
        let result = await response.json();
        console.log(result, "comments")
        renderComments(result.items);
    }
    catch(error){
        console.log(`Error occured`, error)
    }
    
}
let channelID = ""; 
async function  fetchStats(videoId){
    console.log("Inside fetchStats")
    let endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${apikey}&id=${videoId}`;
    try {
        const response = await fetch(endpoint);
        const result = await response.json();
        const item = result.items[0] ;
        channelID = item.snippet.channelId
        ; 
        console.log(item); 
        const likeCount = Count(item.statistics.likeCount); 
        const commnetCount = Count(item.statistics.commentCount); 
        const title = document.getElementById("title");
        title.innerText = item.snippet.title ;
        title.style.color = "white";
        title.style.fontSize = "20px"
        statsContainer.innerHTML = `
        <div class="profile">
           <div class="info-channel">
                <div class = "image-channel">
                    <img src="https://i.ytimg.com/vi/D-qj0L68RhQ/default.jpg" class="channel-logo" alt="">
                </div>
                <div class="owner-details">
                    <span style="color: white ">${item.snippet.channelTitle}</span>
                    <span>20 subscribers    </span>
                </div>
           </div>
            <div class="stats">
                <div class="like-container">
                    <div class="likes">
                        <div class="like">
                            <span class="material-icons">thumb_up</span>
                            <span>${likeCount}</span>
                        </div>
                        <div class="border"></div>
                        <div class="like">
                            <span class="material-icons">thumb_down</span>
                        </div>
                    </div>
                    <div class = "share likes">
                    <span class="material-icons">share</span>
                    Share</div>
                    
                </div>
                
            </div>
        </div>
        <div class="comments-container">
        <span class="comment">Comments</span>
        <span>${commnetCount}</span>
        </div>
        `
    }
    catch(error){

        console.log("error", error)
    }
}

console.log("This is ChannelID",channelID); 

function renderComments(commentsList) {
    const commentsContainer = document.getElementById("comments-container"); 
    // comments Container
    for(let i =  0; i < commentsList.length ; i++) {
        let comment = commentsList[i] ;
        const topLevelComment = comment.snippet.topLevelComment;

        let commentElement = document.createElement("div");
        commentElement.className = "comment" ;
        commentElement.innerHTML = `
                <div class = "comnet-body">
                    <div class = "image-channel">
                        <img src="${topLevelComment.snippet.authorProfileImageUrl}" alt="">
                    </div>
                    <div class="comment-right-half">
                        <b>${topLevelComment.snippet.authorDisplayName
                        }</b>
                        <p>${topLevelComment.snippet.textOriginal}</p>
                        <div class = "like-reply">
                            <div class="like">
                                <span class="material-icons">thumb_up</span>
                                <span>${topLevelComment.snippet.likeCount}</span>
                            </div>
                            <div class="like">
                                <span class="material-icons">thumb_down</span>
                            </div>
                            <button class="reply" onclick="loadComments(this)" data-comment-id="${topLevelComment.id}">
                                Replies(${comment.snippet.totalReplyCount})
                            </button>
                </div>
                    </div>
                </div>
                
            `;
        commentsContainer.append(commentElement);

    }
}

async function loadComments(element){
    const commentId = element.getAttribute("data-comment-id");
    console.log(commentId)
    let endpoint = `https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${commentId}&key=${apikey}`;
    try {
       const response =  await fetch(endpoint);
        const result = await response.json();
        const parentNode = element.parentNode.parentNode ;
        let commentsList = result.items ;
        for(let i = 0 ; i < commentsList.length ; i++) {
            let replyComment =  commentsList[i] ; 
            let commentNode = document.createElement("div");
            commentNode.className = "comment comment-reply";

            commentNode.innerHTML = `
                        <img src="${replyComment.snippet.authorProfileImageUrl}" alt="">
                        <div class="comment-right-half">
                            <b>${replyComment.snippet.authorDisplayName}</b>
                            <p>${replyComment.snippet.textOriginal}</p>
                            <div class="options">
                                <div class="like">
                                    <span class="material-icons">thumb_up</span>
                                    <span>${replyComment.snippet.likeCount}</span>
                                </div>
                                <div class="like">
                                    <span class="material-icons">thumb_down</span>
                                </div>
                            </div>
                    `;

                parentNode.append(commentNode);
        }
    }   
    catch(error){
        console.log("Can't load comment: " + error);
    }
}

function Count(count){ 
    const views = parseInt(count);
  if (views >= 1000000) {
    const millions = Math.floor(views / 1000000);
    const thousands = Math.floor((views % 1000000) / 100000);
    return millions+"."+ thousands + "M ";
  }

  if (views >= 1000) {
    const thousands = Math.floor(views / 1000);
    const hundred = Math.floor(((views % 100000) / 10000))
    return thousands+"."+hundred + "K";
  } else {
    return views.toString();
  }
}


{/* <div class = "download likes">
                    <span class="material-icons">download</span>
                    Download</div> */}
