window.onload = function () {
  if (false && navigator.userAgent.indexOf("Line") > -1) {
    $('#pop-jump').modal('show');
    // Line 內建瀏覽器 直接用外部瀏覽器開啟網頁
    location.href = location.href.indexOf("?") > 0 ? location.href + "&openExternalBrowser=1" : location.href + "?openExternalBrowser=1";
  }

  var apiDomain = 'https://testfapi.52buddha.com';
  var redirectUri = 'https://testf.52buddha.com?inviteMember=';

  var canRun = true; // 可否點擊開始轉
  var config;
  var isLogin; // 登入成功
  var drawTimesBalance = 1; // 可抽獎次數
  var memberId = ''; // 用戶 id for share
  var unFinishPrizeId = 0;
  var todayShareCanGetTimes = '';
  var emailStatus = false;
  var friendStatus = false;
  var drawTimesDone = 0;
  var clickedDarwTimesDone = getCookie('clickedDarwTimesDone') ? getCookie('clickedDarwTimesDone') : '0';
  var actId;

  var product = 1;

  var loadingCount = 0;
  function checkLoading() {
    if (loadingCount > 0) {
      $('.wrap-loading').fadeIn();
    } else {
      $('.wrap-loading').fadeOut();
    }
  }

  /* 有 code 代表由 Line 回調，再與後端做交換 */
  function getLoginInfo() {
    //     FB.getLoginStatus(function(response) {
    //         if ( response.status === 'connected' && response.authResponse ) {
    //             loadingCount++; checkLoading();
    //             axios.post(apiDomain + '/h5free/member/facebookLogin', {
    //                 actId: actId,
    //                 code: response.authResponse.accessToken,
    //                 inviteMember: parseInt( getUrlParameter('inviteMember') ? getUrlParameter('inviteMember') : 0 ),
    //                 redirectUri: redirectUri + ( getUrlParameter('inviteMember') ? getUrlParameter('inviteMember') : 0 )
    //             }).then(function (response) {

    //                 if ( !product )
    //                 response = JSON.parse('{"data":{"code":200,"message":"操作成功","data":{"tokenHead":"Bearer ","token":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMDE1OTA3ODY4OTU2OTI0NiIsImNyZWF0ZWQiOjE2MjMyMjA4ODY2MzAsImV4cCI6MTYyMzgyNTY4Nn0.enbKepVBG8rvtiGOfstKCcvAsZtjSfJcNqpYFnsGKM-3OkFWIVt3fFr723EopL8l6ZOghEAddtMs9XOt3VDG7w"}}}');

    //                 /* 有回傳，並且狀態正確 */
    //                 if ( response && response.data.code === 200 ) {
    //                     config = {headers: {Authorization: response.data.data.tokenHead + response.data.data.token}};
    //                     document.cookie = "auth=" + '{"headers": {"Authorization": "' + response.data.data.tokenHead + response.data.data.token + '"}}';
    //                     // window.history.pushState({}, document.title, "https://farmersbuy.cas.org.tw/taiwan-pineapple2/");
    //                     // window.history.pushState({}, document.title, "/");
    //                     my(); // 重設用戶資訊
    //                 }
    //             }).catch(function () {
    //                 $('#pop-maintain').modal('show');
    //             })
    //             .then(function () {
    //                 loadingCount--; checkLoading();
    //             });
    //         } else if ( getCookie('auth') ) {
    //             config = JSON.parse( getCookie('auth') );
    //             my(); // 重設用戶資訊
    //         }
    //     });

    if (getUrlParameter('code')) {
      loadingCount++; checkLoading();
      axios.post(apiDomain + '/h5free/member/lineLogin', {
        actId: actId,
        code: getUrlParameter('code'),
        inviteMember: parseInt(getUrlParameter('inviteMember') ? getUrlParameter('inviteMember') : 0),
        redirectUri: redirectUri + (getUrlParameter('inviteMember') ? getUrlParameter('inviteMember') : 0)
      }).then(function (response) {
        if (!product)
          response = JSON.parse('{"data":{"code":200,"message":"操作成功","data":{"tokenHead":"Bearer ","token":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJVZDkzYzEwNDY1NTBiYjI4YmVjNTRmZWViYTQ3ZjU2YjUiLCJjcmVhdGVkIjoxNjE3NzY2MjEyNTQ3LCJleHAiOjE2MTgzNzEwMTJ9.mkEFSPlbEhgeJ84cZS9oDSW8ZklF5yITBkr7JgGkF2_vBAwY0jypXUkxcqIN4rD4jte1xWzkzo0JC4Vh3UxM-g"}}}');
        /* 有回傳，並且狀態正確 */
        if (response && response.data.code === 200) {
          config = { headers: { Authorization: response.data.data.tokenHead + response.data.data.token } };
          document.cookie = "auth=" + '{"headers": {"Authorization": "' + response.data.data.tokenHead + response.data.data.token + '"}}';
          // window.history.pushState({}, document.title, "https://farmersbuy.cas.org.tw/taiwan-stayhome/");
          my(); // 重設用戶資訊
        }
      }).catch(function (err) {
        $('#pop-maintain').modal('show');
      })
        .then(function () {
          loadingCount--; checkLoading();
        });
    } else if (getCookie('auth')) {
      config = JSON.parse(getCookie('auth'));
      my(); // 重設用戶資訊
    }
  }

  /* 獲取/重設 用戶資訊 */
  /* mode = true 更新數據 */
  function my(mode) {
    axios.post(apiDomain + '/h5/member/my?actId=' + actId, {}, config).then(function (response) {
      if (response && response.data.code === 200) {
        drawTimesBalance = response.data.data.drawTimesBalance;
        memberId = response.data.data.memberId;
        todayShareCanGetTimes = response.data.data.todayShareCanGetTimes;
        unFinishPrizeId = response.data.data.unFinishPrizeId;
        emailStatus = response.data.data.emailStatus;
        friendStatus = response.data.data.friendStatus;
        drawTimesDone = response.data.data.drawTimesDone;
        $('.count').html(drawTimesBalance);

        if (drawTimesBalance < 1) {
          $('.limit-tips-text').text('返回首頁');
        } else {
          $('.limit-tips-text').text('繼續抽獎');
        }

        if (todayShareCanGetTimes < 1) {
          $('.limit-tips').show();
        } else {
          $('.limit-tips').hide();
        }

        $('.table-count-no-login').hide();
        $('.table-count-login').show();

        // for facebook 當用戶沒有抽過獎，即跳按讚提示
        if (false && drawTimesDone < 1) {
          $('.auth').hide();
          $('.auth-friend-text').show();
          $('.auth-friend').show();
        }

        // for line
        if (true) {
          if (false && !emailStatus && !friendStatus) {
            /* 都沒同意的情況 */
            $('.auth').hide();
            $('.auth-email-text, .auth-friend-text').show();
            $('.auth-both').show();
          } else if (false && !emailStatus && friendStatus) {
            /* 沒有授權 email 但有加入 friend */
            $('.auth').hide();
            $('.auth-email-text').show();
            $('.auth-email').show();
          } else if (!friendStatus) {
            /* 沒有加入 friend */
            $('.auth').hide();
            $('.auth-friend-text').show();
            $('.auth-friend').show();
          }
        }

        /* 更新數據 */
        if (!mode) {
          // 有未填寫的中獎資訊
          if (unFinishPrizeId && unFinishPrizeId > 0) {
            let Prize = prizes.find(x => x.id === unFinishPrizeId);
            $('.tips').text(Prize.title);
            document.getElementById('winner-pic').src = './common/img/' + Prize.picUrl;

            $('.unFinishprizeTime').show();
            $('.unFinishprizeTime span').text(response.data.data.prizeTime);
            $('#pop-winner').modal(); // 顯示中獎
          }

          isLogin = true;
        }
      }
    }).catch(function () {
      // $('#pop-maintain').modal('show');
      isLogin = false;
    })
      .then(function () {
      });
  }

  /* 獲取抽獎記錄 */
  /* reset true 表示重新跑 */
  var pageNum = 1;
  function getRecord(reset) {
    if (reset) {
      pageNum = 1;
      $('.record-list').html('<li><span>抽獎時間</span><span>抽獎結果</span><span>領獎人</span></li>');
    }
    axios.get(apiDomain + '/h5/member/prizeRecord?actId=' + actId + '&pageSize=10&pageNum=' + pageNum, config)
      .then(function (response) {
        if (response && response.status === 200) {
          response.data.data.list.forEach(function (el) {
            $('.record-list').append('<li><span>' + el.recordTime + '</span><span>' + el.title + '</span><span>' + ((el.name) ? el.name : '-') + '</span></li>');
          });
          if (response.data.data.list && response.data.data.list.length > 0) {
            locked = false;
          }
          $('.lds-ellipsis').hide();
        }
      }).catch(function (error) {
      })
      .then(function () {
        $('.lds-ellipsis').hide();
      });
  }

  var locked = false;
  $('.wrap-record-list').scroll(function () {
    if (($('.record-list').height() - ($('.wrap-record-list').scrollTop() + $('.wrap-record-list').height())) < 1) {
      if (locked === false) {
        locked = true;
        pageNum++;
        getRecord();
        $('.lds-ellipsis').show();
      }
    }
  });

  /* 畫圖 */
  function drawRouletteWheel() {
    var canvas = document.getElementById("target");
    if (canvas.getContext) {
      var outsideRadius = 200;
      var textRadius = 150; // 內縮距離
      var insideRadius = 20;
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 500, 500); // 清除指定矩形區域內的內容，使其變為全透明。
      ctx.strokeStyle = "white";
      ctx.lineWidth = 0;
      ctx.font = 'bold 22px Helvetica, Arial';

      for (var i = 0; i < prizes.length; i++) {
        var angle = startAngle + i * arc;
        //ctx.fillStyle = colors[i];
        if (i % 2 === 0) {
          ctx.fillStyle = '#FAFAF0';
        } else {
          ctx.fillStyle = '#FFFFFF';
        }

        ctx.beginPath();
        ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
        ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();
        ctx.save();
        // ctx.shadowOffsetX = -1;
        // ctx.shadowOffsetY = -1;
        // ctx.shadowBlur = 0;
        // ctx.shadowColor = "rgb(220,220,220)";
        ctx.fillStyle = "#40210F"; // 文字顏色
        ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius); // 文字偏移
        ctx.rotate(angle + arc / 2 + Math.PI / 2); // 文字角度
        var text = prizes[i].title;
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);

        let img = $('.wrap-wheel').find('img[src$="' + prizes[i].picUrl + '"]');
        ctx.drawImage(img[0], -30, 10, 70, 70);
        ctx.restore();
      }
    }
  }

  var prizes = [];
  var startAngle = 0;
  var arc = 0;
  var ctx;
  var desc_prizes = [];
  /* 獲取獎項列表 */
  loadingCount++; checkLoading();
  axios.get(apiDomain + '/h5free/prize/list', {
  }).then(function (response) {
    console.log('res',response.data.data)

    if (!product)
      response = JSON.parse('{"data": {"code":200,"message":"操作成功","data":{"prizeList":[{"id":1,"title":"果汁冰沙機","picUrl":"1.png","detail":""},{"id":2,"title":"再接再厲","picUrl":"2.png","detail":""},{"id":3,"title":"鳳梨福袋","picUrl":"3.png","detail":""},{"id":4,"title":"再接再厲","picUrl":"4.png","detail":""},{"id":5,"title":"鳳梨驚喜包","picUrl":"5.png","detail":""},{"id":6,"title":"隨行果汁機","picUrl":"6.png","detail":""}],"startTime":"2021年04月15日","endTime":"2021年04月30日","errorType":0,"actId":3}}}');

    /* 活動編號 */
    if (response.data && response.data.data.actId) {
      actId = response.data.data.actId;
    }
    /* 有回傳時間 */
    if (response.data && response.data.data.startTime && response.data.data.endTime) {
      $('.startTime').text(response.data.data.startTime);
      $('.endTime').text(response.data.data.endTime);
    }

    if (response.data) {
      prizes = response.data.data.prizeList;
      arc = Math.PI / (prizes.length / 2);

      /* 獎項列表 */
      prizes.forEach(function (el) {
        if (el.detail) {
          desc_prizes = desc_prizes.concat(JSON.parse(el.detail));
        }
      });
      let desc_prizes_html = '';
      desc_prizes.forEach(function (el) {
        desc_prizes_html += '<li><h4>' + el.title + '</h4>';
        if (el.content) {
          desc_prizes_html += '<p>';
          el.content.forEach(function (e) {
            desc_prizes_html += e + '<br>';
          });
          desc_prizes_html += '</p>';
        }
        desc_prizes_html += '</li>';
      });
      $('.desc-prizes').append(desc_prizes_html);

      // 畫圖
      drawRouletteWheel();
    }

    if (response.data && response.data.data.errorType === 0) {
      // 取得獎項列表以後再獲取用戶資訊
      getLoginInfo();
    } else if (response.data && response.data.data.errorType === 1) {
      /* 維護狀態 */
      $('#pop-maintain').modal('show');
    } else if (response.data && response.data.data.errorType === 2) {
      /* 未開始 */
      $('#pop-campaign-not-yet').modal('show');
    } else if (response.data && response.data.data.errorType === 3) {
      /* 已結束 */
      $('#pop-campaign-end').modal('show');
    }


  }).catch(function (error) {
    $('#pop-maintain').modal('show');
  })
    .then(function () {
      setTimeout(() => {
        loadingCount--; checkLoading();
      }, 1000);
    });

  var eachAngle = 0; // 計算等分的度
  var cycle = 0; // 最少要轉多少，必須以 360 為倍數
  var min = ''; // 最小指針
  var max = ''; // 最大指針
  var point = 0; // 指針
  var cssAnimation = ''; // 動態生成 css
  var rules = ''; // animation
  var startRotate = 0;
  /* 開始遊戲 */
  function startGame(tar) {
    let Prize = prizes.find(x => x.id === tar.prizeId);
    unFinishPrizeId = tar.prizeId;

    eachAngle = 360 / prizes.length; // 計算等分的度
    cycle += eachAngle * 60; // 累加為了第二次以上的點擊銜接

    min = (270 - eachAngle) - (eachAngle * prizes.indexOf(Prize));
    max = min + eachAngle;

    var gap = 6; // 保險起見，做一個 gap 配置，以防止太過接近有爭議
    min = min + gap;
    max = max - gap;

    point = cycle + Math.floor(Math.random() * (max - min + 1)) + min; // 指針的位置範圍

    var runTime = Math.floor(Math.random() * (8 - 6 + 1)) + 6; // 隨機轉圈速度

    // start 生成動畫 CSS
    cssAnimation = document.createElement('style');
    cssAnimation.type = 'text/css';
    rules = document.createTextNode(
      '.move {animation: mymove ' + runTime + 's forwards;}' +
      '@keyframes mymove {' +
      '0% { transform:rotate(' + startRotate + 'deg) }' +
      '6% { transform:rotate(' + (startRotate - 6) + 'deg) }' +
      '70% { transform:rotate(' + (point + 5) + 'deg) }' +
      '80% { transform:rotate(' + (point - 2) + 'deg) }' +
      '100% { transform:rotate(' + point + 'deg) }' +
      '}' +
      '.cycle-shadow-ani {' +
      'animation: cycle-ani ' + runTime + 's linear forwards;' +
      '}'
    );
    cssAnimation.appendChild(rules);
    document.getElementsByTagName("head")[0].appendChild(cssAnimation);
    // end 生成動畫 CSS

    if (tar.extendInfo) {
      $('.tips').text('折扣券代碼：' + tar.extendInfo);
    } else {
      $('.tips').text(Prize.title);
    }

    document.getElementById('winner-pic').src = './common/img/' + Prize.picUrl;

    // $('.game').addClass('shake');
    // setTimeout(() => {
    //     $('.game').removeClass('shake');
    // }, (runTime * 1000) - 2000);


    document.getElementById('target').classList.add("move");

    $('#cycle-shadow').addClass('cycle-shadow-ani');
    setTimeout(function () {
      $('#cycle-shadow').removeClass('cycle-shadow-ani');
      document.getElementById("target").style.transform = "rotate(" + point + "deg)";
      if (!tar.noPrize) {
        $('.unFinishprizeTime').hide(); // 上一次未填寫資料才要顯示
        $('#pop-winner').modal(); // 顯示中獎
      } else {
        if (tar.extendInfo) {
          $('#pop-number').modal(); // 折扣券
        } else {
          $('#pop-tips').modal(); // 顯示未中獎
        }
      }

      setTimeout(() => {
        canRun = true;
      }, 1000);
    }, runTime * 1000);
    startRotate = point;
  }
  /* ----------------------------------------- 點擊以後的效果 ----------------------------------------- */
  $('#click-game-area, #gifts').on('click', function () {
    if (!isLogin) {
      loginThirdParty();
    } else if (friendStatus === false) {
      // } else if ( drawTimesDone < 1 && clickedDarwTimesDone == '0' ) {
      /* 未完成驗證 */
      $('#pop-email-friends').modal('show');
      document.cookie = "clickedDarwTimesDone=" + '1'; // 用戶點過以後就不再做此檢查
    } else if (canRun && drawTimesBalance <= 0) {
      /* 沒有抽獎次數 */
      $('#pop-zero').modal('show');
    } else if (canRun && drawTimesBalance > 0) {
      // 當動效停止後的位置，避免下一次轉動畫面閃爍，秒數需要聯動 css move
      canRun = false;

      $("#pointer img").attr('src', './common/img/wheel-btn-arrow.png').css({ 'margin-top': '3px', 'width': '19vw' }); // 按鈕效果
      $("#pointer-shadow").addClass('pointer-shadow-down').css({ 'width': '17vw' });

      document.getElementById('target').classList.remove("move");
      axios.get(apiDomain + '/h5/prize/run/' + actId, config).then(function (response) {
        $("#pointer img").attr('src', './common/img/wheel-btn-arrow-up.png').css({ 'margin-top': '0px', 'width': '20vw' });; // 按鈕效果
        $("#pointer-shadow").removeClass('pointer-shadow-down').css({ 'width': '20vw' });

        startGame(response.data.data);

        my(true); // 重設 用戶資訊
      }).catch(function () {
        $('#pop-maintain').modal('show');
        isLogin = false;
      })
        .then(function () {
        });
    }
  })

  /* 同意請求 */
  $('.go-login').on('click', function () {
    loginThirdParty();
  });

  /* 分享按鈕 */
  $('.go-share').on('click', function () {
    goShare();
  });

  /* 分享 Line */
  function goShare() {
    if (isLogin) {
      window.location.href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURI(redirectUri + memberId);
      // window.location.href = 'https://www.facebook.com/sharer/sharer.php?u='+ encodeURI( redirectUri + memberId );
      // window.open( 'https://www.facebook.com/sharer/sharer.php?u='+ encodeURI( redirectUri + memberId ) );
      // FB.ui({
      //     method: 'feed',
      //     link: redirectUri + memberId
      // }, function(response){});
    } else {
      loginThirdParty();
    }
  }

  /* 導向 Line 登入 */
  function loginThirdParty() {
    // FB.getLoginStatus((response) => {
    //     if (response.status == "connected") {
    //         getLoginInfo();
    //     } else {
    //         FB.login(function(response) {
    //             if (response.status === 'connected') {
    //                 getLoginInfo();
    //             } else {
    //                 // The person is not logged into your webpage or we are unable to tell.
    //                 window.location.href = window.location.href;
    //             }
    //         });
    //     }
    // });

    let client_id = '1655805820';
    let redirect_uri = redirectUri + (getUrlParameter('inviteMember') ? getUrlParameter('inviteMember') : 0);
    let link = 'https://access.line.me/oauth2/v2.1/authorize?';
    link += 'response_type=code';
    link += '&client_id=' + client_id;
    link += '&redirect_uri=' + redirect_uri;
    link += '&state=login';
    link += '&bot_prompt=aggressive';
    link += '&scope=profile%20openid%20email';
    window.location.href = link;
  }

  /* 取得 URL 的特定參數值 */
  function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  };


  /* 活動說明 */
  $('.campaign-desc').on('click', function () {
    $('#popup-description').modal();
  });

  /* 關閉彈窗，並且調用一次 my */
  $('.close-modal-do-my').on('click', function () {
    $('.modal').modal('hide');
    if (isLogin) {
      my(true); // 重設 用戶資訊
    }
  })

  /* 關閉彈窗，並且調用一次 getLoginInfo */
  $('.close-modal-do-getLoginInfo').on('click', function () {
    window.location.href = window.location.href;
  })

  /* 中獎記錄 */
  $('.winner-record').on('click', function () {
    getRecord(true); // 重新設定抽獎記錄
    $('.lds-ellipsis').show();
    $('#popup-record').modal();
  });

  /* 前往領獎 */
  $('.submit-data').on('click', function () {
    $('#pop-winner').modal('hide');
    $('#pop-address').modal('show');
  });

  /* 折扣券 */
  $('.submit-number-data').on('click', function () {
    $('#pop-number').modal('hide');
    window.open('https://farmersbuy.cas.org.tw/mango');
  });

  /* 送出資料 */
  $('.submit-info').on('click', function () {
    if ($('#counties').val() === '縣市' || $('#cities').val() === '地區') {
      $('#pop-address .pop-address-tips').show();
      $('#pop-address .pop-address-tips').text('請選擇正確地址');
      return;
    }
    loadingCount++; checkLoading();
    axios.post(apiDomain + '/h5/prize/contactInfo', {
      "actId": actId,
      "name": $('#name').val(),
      "phoneNumber": $('#phoneNumber').val(),
      "email": $('#email').val(),
      "address": $('#counties').val() + $('#cities').val() + $('#address').val()
    }, config).then(function (response) {
      if (response.data.code === 200) {
        $('#pop-address .pop-address-tips').text('');
        $('#name').val('');
        $('#phoneNumber').val('');
        $('#email').val('');
        $('#address').val('');
        $('#counties').val('縣市');
        $('#cities').val('地區');

        $('#pop-address .pop-address-tips').hide();
        $('#pop-address').modal('hide');
        $('#pop-finish').modal('show');
      } else {
        $('#pop-address .pop-address-tips').show();
        $('#pop-address .pop-address-tips').text(response.data.message);
      }

    }).catch(function () {
      $('#pop-maintain').modal('show');
    })
      .then(function () {
        loadingCount--; checkLoading();
      });
  });

  var cities_object = JSON.parse('{"台北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],"基隆市": ["仁愛區", "中正區", "信義區", "中山區", "安樂區", "暖暖區", "七堵區"],"新北市": ["板橋區", "新莊區", "中和區", "永和區", "土城區", "樹林區", "三峽區", "鶯歌區", "三重區", "蘆洲區", "五股區", "泰山區", "林口區", "八里區", "淡水區", "三芝區", "石門區", "金山區", "萬里區", "汐止區", "瑞芳區", "貢寮區", "平溪區", "雙溪區", "新店區", "深坑區", "石碇區", "坪林區", "烏來區"],"宜蘭縣": ["宜蘭市", "頭城鎮", "羅東鎮", "蘇澳鎮", "礁溪鄉", "壯圍鄉", "員山鄉", "冬山鄉", "五結鄉", "三星鄉", "大同鄉", "南澳鄉"],"桃園市": ["桃園區", "中壢區", "平鎮區", "八德區", "楊梅區", "蘆竹區", "大溪區", "龍潭區", "龜山區", "大園區", "觀音區", "新屋區", "復興區"],"新竹市": ["東區", "北區", "香山區"],"新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "峨眉鄉", "寶山鄉", "北埔鄉", "芎林鄉", "橫山鄉", "尖石鄉", "五峰鄉"],"苗栗縣": ["苗栗市", "頭份市", "竹南鎮", "後龍鎮", "通霄鎮", "苑裡鎮", "卓蘭鎮", "造橋鄉", "西湖鄉", "頭屋鄉", "公館鄉", "銅鑼鄉", "三義鄉", "大湖鄉", "獅潭鄉", "三灣鄉", "南庄鄉", "泰安鄉"],"台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區", "豐原區", "后里區", "石岡區", "東勢區", "新社區", "潭子區", "大雅區", "神岡區", "大肚區", "沙鹿區", "龍井區", "梧棲區", "清水區", "大甲區", "外埔區", "大安區", "和平區"],"彰化縣": ["彰化市", "員林市", "和美鎮", "鹿港鎮", "溪湖鎮", "二林鎮", "田中鎮", "北斗鎮", "花壇鄉", "芬園鄉", "大村鄉", "永靖鄉", "伸港鄉", "線西鄉", "福興鄉", "秀水鄉", "埔心鄉", "埔鹽鄉", "大城鄉", "芳苑鄉", "竹塘鄉", "社頭鄉", "二水鄉", "田尾鄉", "埤頭鄉", "溪州鄉"],"南投縣": ["南投市", "埔里鎮", "草屯鎮", "竹山鎮", "集集鎮", "名間鄉", "鹿谷鄉", "中寮鄉", "魚池鄉", "國姓鄉", "水里鄉", "信義鄉", "仁愛鄉"],"嘉義市": ["東區", "西區"],"嘉義縣": ["太保市", "朴子市", "布袋鎮", "大林鎮", "民雄鄉", "溪口鄉", "新港鄉", "六腳鄉", "東石鄉", "義竹鄉", "鹿草鄉", "水上鄉", "中埔鄉", "竹崎鄉", "梅山鄉", "番路鄉", "大埔鄉", "阿里山鄉"],"雲林縣": ["斗六市", "斗南鎮", "虎尾鎮", "西螺鎮", "土庫鎮", "北港鎮", "林內鄉", "古坑鄉", "大埤鄉", "莿桐鄉", "褒忠鄉", "二崙鄉", "崙背鄉", "麥寮鄉", "台西鄉", "東勢鄉", "元長鄉", "四湖鄉", "口湖鄉", "水林鄉"],"台南市": ["中西區", "東區", "南區", "北區", "安平區", "安南區", "永康區", "歸仁區", "新化區", "左鎮區", "玉井區", "楠西區", "南化區", "仁德區", "關廟區", "龍崎區", "官田區", "麻豆區", "佳里區", "西港區", "七股區", "將軍區", "學甲區", "北門區", "新營區", "後壁區", "白河區", "東山區", "六甲區", "下營區", "柳營區", "鹽水區", "善化區", "大內區", "山上區", "新市區", "安定區"],"高雄市": ["楠梓區", "左營區", "鼓山區", "三民區", "鹽埕區", "前金區", "新興區", "苓雅區", "前鎮區", "旗津區", "小港區", "鳳山區", "大寮區", "鳥松區", "林園區", "仁武區", "大樹區", "大社區", "岡山區", "路竹區", "橋頭區", "梓官區", "彌陀區", "永安區", "燕巢區", "田寮區", "阿蓮區", "茄萣區", "湖內區", "旗山區", "美濃區", "內門區", "杉林區", "甲仙區", "六龜區", "茂林區", "桃源區", "那瑪夏區"],"澎湖縣": ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],"金門縣": ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],"屏東縣": ["屏東市", "潮州鎮", "東港鎮", "恆春鎮", "萬丹鄉", "長治鄉", "麟洛鄉", "九如鄉", "里港鄉", "鹽埔鄉", "高樹鄉", "萬巒鄉", "內埔鄉", "竹田鄉", "新埤鄉", "枋寮鄉", "新園鄉", "崁頂鄉", "林邊鄉", "南州鄉", "佳冬鄉", "琉球鄉", "車城鄉", "滿州鄉", "枋山鄉", "霧台鄉", "瑪家鄉", "泰武鄉", "來義鄉", "春日鄉", "獅子鄉", "牡丹鄉", "三地門鄉"],"台東縣": ["台東市", "成功鎮", "關山鎮", "長濱鄉", "池上鄉", "東河鄉", "鹿野鄉", "卑南鄉", "大武鄉", "綠島鄉", "太麻里鄉", "海端鄉", "延平鄉", "金峰鄉", "達仁鄉", "蘭嶼鄉"],"花蓮縣": ["花蓮市", "鳳林鎮", "玉里鎮", "新城鄉", "吉安鄉", "壽豐鄉", "光復鄉", "豐濱鄉", "瑞穗鄉", "富里鄉", "秀林鄉", "萬榮鄉", "卓溪鄉"],"連江縣": ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]}');
  var cities_html;
  $("#counties").on('change', function () {
    cities_html = '<option>地區</option>';
    cities_object[this.value].forEach(function (el) {
      cities_html += '<option value="' + el + '">' + el + '</option>';
    });
    $('#cities').html(cities_html);
  });

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  /* 禁止雙擊放大 */
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);


  var myTimer;
  function myFunction() {
    myTimer = setInterval(function () {
      if (isLogin) {
        my(true); // 重設 用戶資訊
      } else {
        clearTimeout(myTimer);
      }
    }, 5000);
  }
  $(window).focus(function () {
    myFunction();
  });
  $(window).blur(function () {
    clearTimeout(myTimer);
  });
  myFunction();
};

