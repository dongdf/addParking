
Page({
  data: {
    mheight:0,
    adrinfo: { real: '', rec: ''},
    showji:false,
    mylist:[],
    imgList:[],
    rey:0,
    mylng:'',
    mylat:''
  },
  gode:function(e){

      console.log(e);
  },
  openmap:function(e){
    var obj = e.currentTarget.dataset.pointer;
    wx.openLocation({//打开地图
      longitude: parseFloat(obj.address_Lng),
      latitude: parseFloat(obj.address_Lat),
      name: obj.title,
      address: obj.address
    })
  },
  opendetail:function(e){
    console.log(e);
    wx.navigateTo({
      url: './detail?id=' + e.currentTarget.dataset.pointer.id,
    })
  },
  gomodi:function(){
    let that = this;
    wx.navigateTo({
      url: './modify?rec=' + that.data.adrinfo.rec,
    })
  },
  autopointer:function(){
    let that = this;
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log(res);
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        console.log(latitude)
        console.log(longitude)
        getApp().get('api/logs/get_poi?location=' + latitude + ',' + longitude).then(lres=>{
          // console.log(lres)
          getApp().globalData.rename = lres.result.formatted_addresses.recommend
          that.setData({
            'adrinfo.rel': lres.result.address,
            'adrinfo.rec': lres.result.formatted_addresses.recommend,
            mylng: longitude,
            mylat: latitude,

          })
          
          

        })
       
      },
      fail: function (err) {
        wx.showModal({
          title: '获取位置失败',
          showCancel: false,
          content: '点击确定打开设置，请确保手机允许微信获取定位',
          success: function () {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
                // res.authSetting = {
                //   "scope.userInfo": true,
                //   "scope.userLocation": true
                // }
              }
            })
          }
        })
      }
    })
  },
  onShow: function () {
    this.setData({
      'adrinfo.rec': getApp().globalData.rename
    })
    this.getrecord()
    

  },
  onLoad:function(){
    let that = this;
    if (wx.getStorageSync('ppid')) {
      this.setData({
        showji: true
      })
      
       that.autopointer();
    } else {
      this.setData({
        showji: false
      })
    }
    this.getrecord()
    
    

    
   
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        console.log(height)
        that.setData({
          rey: height -515 + "rpx",

          mheight: height-450 + "rpx"

        })

      }

    })
     
  },
  getrecord:function(){
    getApp().get('api/logs/lists?page=1&size=1').then(res=>{
      if(res){
        this.setData({
          mylist: res
        })
      }else{
        this.setData({
          mylist: []
        })
      }
    
    })

  },
  addCard:function(){
    let that =this
    var pd={
      title: that.data.adrinfo.rec,
      content:'',
      imgs: JSON.stringify(that.data.imgList),
      address_Lng: that.data.mylng,//地点经度
      address_Lat: that.data.mylat,//地点纬度
      address: that.data.adrinfo.rel,
      adr_name:''
     
    }
    getApp().post('api/logs/add',pd).then(res=>{
       wx.showToast({
         title: '记录完成',
       })
      that.getrecord();
    })
  },

  uploadpic: function (e) {
    var that = this;

    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        that.startupload(tempFilePaths);
        wx.showLoading({
          title: '上传中...',
        })


      }
    })


  },
  startupload: function (objs) {
    var that = this;
    var i = 0;
    var showtemp = this.data.imgList;
    up();
    function up() {
      wx.uploadFile({
        url: 'https://pc.quankuaile.com/Project/chewei/index.php/logs/addAttachment', // 仅为示例，非真实的接口地址
        filePath: objs[i],
        name: 'file',
        formData: {
          user: 'test'
        },
        fail: (res) => {
          // up();
        },
        complete: function (complete) {

          var temp = JSON.stringify(complete.data);
          if (temp.indexOf('400 Bad Request') >= 0) {
            up();
            return;
          }
          // console.log(complete.data);
          var orgimg = JSON.parse(complete.data);
          console.log(orgimg.data);
          showtemp=[]
          showtemp.push({ img: orgimg.data });
          i++;
          if (i < objs.length) {
            up();
          } else {
            
            that.setData({
              imgList: showtemp
               
            })
            console.log(that.data.imgList)
            wx.hideLoading()
            return false;

          }

        }
      })

    }

  },

  bindGetUserInfo: function (e) {
    console.log(e);
    var that = this;

    if (e.detail.rawData) {
      wx.login({
        success: function (res) {
          if (res.code) {
            console.log(res);
            wx.showLoading({
              title: '登录中..',
            })
            //发起网络请求
            getApp().get('login/getOpenIdByCode?code=' + res.code).then(opres => {
              // wx.showModal({
              //   title: '44',
              //   content: '44',
              // })
              wx.setStorageSync('ppid', opres.openid);
              getApp().post('login/login', JSON.parse(e.detail.rawData)).then(info => {
                // wx.showModal({
                //   title: '12',
                //   content: '12',
                // })
                wx.hideLoading();
                that.autopointer();
                that.getrecord()
                that.setData({
                  showji: true
                })

              })

            }, error => {
              wx.showModal({
                title: '提示',
                showCancel: false,
                content: JSON.stringify(error),
              })
            })
          } else {
            wx.showToast({
              title: 'wxlogin获取code失败',
            })
          }
        },

      });


    } else {
      wx.showModal({
        title: '提示',
        content: '请允许否则无法正常使用',
      })
      // wx.showToast({
      //   title: '请点击允许',
      //   image: '/image/tips.png',
      // })
    }


  },


  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  }
})