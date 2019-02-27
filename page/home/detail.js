Page({
  data: {
    curimg:'',
    mine:{},
    imgs:[],
    parkInfo:{},
    carinfoId:'',
    mheight: 0,
    rey: 0,
    mylng: '',
    mylat: '',
    markers: [],
  },
  autopointer: function () {
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
        that.setData({
          mylng: longitude,
          mylat: latitude,

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
  gopark:function(){
    var obj = this.data.parkInfo;
    wx.openLocation({//打开地图
      longitude: parseFloat(obj.address_Lng),
      latitude: parseFloat(obj.address_Lat),
      name: obj.title,
      address: obj.address
    })
  },
  delpark:function(){
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除此标记吗？',
      success(res) {
        if (res.confirm) {
          getApp().get('logs/del?id='+that.data.parkInfo.id).then(res=>{
            wx.showToast({
              title: '删除成功',
            })
          })
          setTimeout(()=>{
            wx.navigateBack({
              
            })

          },1500)
          
           
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  gohome:function(){
    wx.navigateTo({
      url: '../../page/home/index',
    })
  },
  getcarinfo:function(){
    getApp().get('api/logs/find?id='+this.data.carinfoId).then(res=>{
      var ps = [];
      var mk = {
        iconPath: '../../image/cardp2.png',
        id: 0,
        longitude: parseFloat(res.address_Lng),
        latitude: parseFloat(res.address_Lat),
        width: 40,
        height: 40
      }
      ps.push(mk)
      this.setData({
        parkInfo:res,
        markers: ps
      })
      this.autopointer();
      
      
      var s = JSON.parse(res.img_list)
      console.log(s);
      if(s.length>0){
        this.setData({
          curimg:s[0].img,
          imgs:s
        })
        console.log(s[0].img)
      }

    })

  },
  pvimg:function(e){
    let that = this;
    var imgarray = [];
    imgarray.push(this.data.curimg)
    wx.previewImage({
      current: this.data.curimg,
      urls: imgarray // 需要预览的图片http链接列表
    })
  },
  onLoad: function (options) {
    this.getmine();
    let that = this;
    if(options.id){
      this.setData({
        carinfoId:options.id
      })
      this.getcarinfo();
    }
    that.autopointer();
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        console.log(height)
        that.setData({
          rey: height - 515 + "rpx",

          mheight: height - 340 + "rpx"

        })

      }

    })

  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  getmine:function(){
    getApp().get('user/findUserInfo').then(res=>{
      this.setData({
        mine:res
      })
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let that = this;
    var name = that.data.mine.nickname ? that.data.mine.nickname:''
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: name+'给你发送了一个车位共享信息',
      path: '/page/home/detail?id=' + that.data.parkInfo.id,

      success: function (res) {
        // 转发成功
        console.log('ok');
      },
      fail: function (res) {
        // 转发失败
      }
    }


  },
})