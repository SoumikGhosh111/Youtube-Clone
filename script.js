const APIkey = "AIzaSyAfgUa4P7751n20O113zUKmIPsoojoanrQ";
const baseUrl = "https://www.googleapis.com/youtube/v3";

// localStorage.setItem("api_Key", APIkey);

// ApiKeys 
// key 1... AIzaSyB-xjG2MYpMlIQlONUe_Vm75Ix2JAg_B7s
// key 2... AIzaSyAfgUa4P7751n20O113zUKmIPsoojoanrQ

// let SearchSTR = "Rahul Gandhi"; 
// this is to fetch the videos from the youtube web servers...
async function onSearchResults(SearchSTR) {
    const endPoint = `${baseUrl}/search?key=${APIkey}&q=${SearchSTR}&maxResults=21&part=snippet`;
    try {
        const response = await fetch(endPoint);
        const result = await response.json();
        // console.log(result);
        for(let i = 0; i<result.items.length; i++){ 
            const videoId = result.items[i].id.videoId; 
            const videoObject = await videoDetails(videoId); 
            result.items[i].stats = videoObject; 

            const channelID = result.items[i].snippet.channelId; 
            const channelObject = await channelDetails(channelID); 
            result.items[i].channelDetails = channelObject; 
        }
        console.log(result.items); 
        renderingVideos(result.items);
    }
    catch (e) {
        console.error(e);
    }

}

// video details fetcher
async function videoDetails(videoID){ 
    const endPoint = `${baseUrl}/videos?key=${APIkey}&part=snippet,statistics,contentDetails&id=${videoID}`;
    try{ 
        const response = await fetch(endPoint); 
        const result = await response.json();
        return result.items[0]; 
    }
    catch(e){ 
        console.error(e); 
    }
}


async function channelDetails(channelID){ 
    const endPoint = `${baseUrl}/channels?key=${APIkey}&part=snippet&id=${channelID}`; 
    try{ 
        const response = await fetch(endPoint); 
        const result = await response.json(); 
        return result.items[0]; 
        // console.log(result); 
    }
    catch(e){ 
        console.error(e); 
    }
}


// calculating the upload time ago 
function ulpoadTimeAgo(time) {
    const upTime = new Date(time);
    const currTime = new Date();
    const timeDiff = currTime - upTime;

    // secs mins hrs days weeks months yrs calculation
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hrs = Math.floor(minutes / 60);
    const days = Math.floor(hrs / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const yrs = Math.floor(months / 12);

    if (yrs > 0) {
        if (yrs === 1) {
            return yrs + 'year ago';
        }
        return yrs + 'years ago';
    }
    if (months > 0) {
        if (months === 1) {
            return months + 'month ago'
        }
        return months + 'months ago';
    }
    if (weeks > 0) {
        if (weeks === 1) {
            return weeks + 'week ago'
        }
        return weeks + 'weeks ago';
    }
    if (days > 0) {
        if (days === 1) {
            return days + 'day ago'
        }
        return days + 'days ago';
    }
    if (hrs > 0) {
        if (hrs === 1) {
            return hrs + 'hour ago'
        }
        return hrs + 'hours ago';
    }
    if (minutes > 0) {
        if (minutes === 1) {
            return minutes + 'minute ago';
        }
        return minutes + 'minutes ago';
    }
    if (seconds > 0) {
        if (seconds === 1) {
            return seconds + 'second ago';
        }
        return seconds + 'seconds ago';
    }
}

// for total views
function videoViews(count){ 
    const views = parseInt(count);
  if (views >= 1000000) {
    const millions = Math.floor(views / 1000000);
    // const thousands = Math.floor((views % 1000000) / 1000);
    return millions + "M ";
  }if (views >= 1000) {
    const thousands = Math.floor(views / 1000);
    return thousands + "K";
  } else {
    return views.toString();
  }
}

// video duration
function  parseDuration(duration){ 
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;


    if(hours === 0){ 
        if(minutes === 0){ 
            return `Shorts`; 
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; 
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

//  video details
const row = document.getElementById("vid-row");

function resetPage() {
    row.innerHTML = '';
}
function renderingVideos(videos) {
    resetPage();
    videos.forEach(video => {

        const time = video.snippet.publishTime;
        const uploadTime = ulpoadTimeAgo(time);

        const totalViews = videoViews(video.stats.statistics.viewCount); 
        const videoDuration = parseDuration(video.stats.contentDetails.duration); 
        // const videoID = video.id.videoId; 

        const channelThumbnail = video.channelDetails.snippet.thumbnails.high.url; 
        const card = document.createElement("div");
        card.className = "video-cards";
        card.innerHTML = `<div class="image-div">
            <img src="${video.snippet.thumbnails.high.url}" alt="">
            <span class="duration"> ${videoDuration}</span>  
        </div>
        <div class="video-content-div">
            <div class="video-content-image-div">
                <img src="${channelThumbnail}" alt="">
            </div>
            <div class="video-content-paragraph">
                <p>
                    ${video.snippet.title}                                                    
                </p>
            </div>
        </div>
        <div class="channel">
            <div class="channel-inner">
                <h4>
                    ${video.snippet.channelTitle}
                </h4>
            </div>
        </div>
        <div class="views-upload-time">
            <div class="view-upload-time-inner">
                ${totalViews} views • ${uploadTime}
            </div>
            </div>`;
            row.appendChild(card);
            // let videoCards = document.querySelector(".video-cards"); 
            card.addEventListener("click", ()=>{ 
                navigateToVideo(video.id.videoId); 
                navigateToChannel(video.snippet.channelId); 
            })

    });

}

function navigateToVideo(videoId){
    let path = `video.html`;
    if(videoId){
  
      document.cookie = `video_id=${videoId}; path=${path}`;
      let linkItem = document.createElement("a");
    //   linkItem.href = "http://127.0.0.1:5500/video.html"
    linkItem.href = "https://soumikghosh111.github.io/Youtube-Clone/video.html"; 
      linkItem.target = "_blank";
      linkItem.click();
    }
    else {
      alert("Can't load the video: Watch it on YouTube")
    }
}

// function navigateToChannel(videoId){
//     let path = `video.html`;
//     if(videoId){
  
//       document.cookie = `video_id=${videoId}; path=${path}`;
//       let linkItem = document.createElement("a");
//       linkItem.href = "http://127.0.0.1:5500/video.html"
//       linkItem.target = "_blank";
//       linkItem.click();
//     }
//     else {
//       alert("Can't load the video: Watch it on YouTube")
//     }
// }

const searchSTR = document.getElementById("search");

const searchButton = document.querySelector(".search-button");

searchButton.addEventListener("click", () => {
    onSearchResults(searchSTR.value);
});
searchSTR.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        onSearchResults(searchSTR.value);
    }
})




let sideBar = document.querySelector(".sidebar"); 
let menuButton = document.querySelector(".logo-and-more-button button"); 
let restBody = document.querySelector(".rest-body"); 


menuButton.addEventListener("click", ()=>{ 
    sideBar.classList.toggle("sidebar-hidden"); 
    restBody.style.flex = "1"; 
})


// dummy of the card that is needed to be implemented
//  <div class="video-cards">
// <div class="image-div">
//     <img src="https://picsum.photos/300/200" alt="">
//     <span class="duration">28:28</span>
// </div>
// <div class="video-content-div">
//     <div class="video-content-image-div">
//         <img src="https://picsum.photos/300/200" alt="">
//     </div>
//     <div class="video-content-paragraph">
//         <p>
//             Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minus vel ipsa itaque
//             provident dignissimos, aspernatur maiores? Mollitia, quia aut!
//         </p>
//     </div>
// </div>
// <div class="channel">
//     <div class="channel-inner">
//         <h3>
//             Fing
//         </h3>
//     </div>
// </div>
// <div class="views-upload-time">
//     <div class="view-upload-time-inner">
//         1.9M views.1Year Ago
//     </div>
// </div>
// </div>

onSearchResults("West Bengal"); 
