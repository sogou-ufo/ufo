define(function(){
	function SimpleCarousel(selector,options){ 
		var s=this;	
		s.container=$(selector)[0];
		s._initOpt(options)
		s.running=false;
		s.currentIndex=0

		s.items=$(s.itemSelector,s.container)
		s.initOffset = s.items[0].offsetLeft
		s.container.scrollLeft = 0
	}

	SimpleCarousel.prototype={	
		_initOpt:function(opt){
			this.itemSelector=opt.itemSelector||".js_item"
			this.step=opt.step||2
			this.doTimes = opt.doTimes || 36
			this.totalTime = opt.totalTime || 2e3
			this.easing=opt.easing || "swing"
		},

		next:function(){
			if (this.running) return ! 1;
			this.running = !0;

			var s=this,
				len=s.items.length,
				a=s.items,
				to=(s.currentIndex+s.step+len)%len;
			if (a[this.currentIndex].offsetLeft > a[to].offsetLeft){		
				for (var d = 0; d < this.step; ++d) {
					var e = (to + d + a.length) % a.length;
					a[this.currentIndex].parentNode.appendChild(a[e])			
				}	//return;	
			} 
			s.switchTo(to)
			//this.container.scrollLeft=200;
		},
		previous:function(){
			if (this.running) return ! 1;
			this.running = !0;

			var s=this,
				len=s.items.length,
				a=s.items,
				to=(s.currentIndex-s.step+len)%len;
			if (a[this.currentIndex].offsetLeft < a[to].offsetLeft){		
				for (var d = 0; d < this.step; ++d) {
					var e = (to + this.step - 1 - d + a.length) % a.length;
					a[this.currentIndex].parentNode.insertBefore(a[e], a[this.currentIndex].parentNode.firstChild)		
				}	//return;	
			} 
			s.switchTo(to)
		},
		switchTo:function(to){
			console.log(to)
			this.relatedIndex = to;	

			this._doAnimation(this.currentIndex, this.relatedIndex)

			this.currentIndex = this.relatedIndex
		},
		_doAnimation:function(a,b){
			var c = this.items[a].offsetLeft,		//运动开始位置
				d = this.items[b].offsetLeft - this.initOffset; //运动结束位置

				console.log(this.initOffset)
				console.log(d)

			f = this.doTimes,
			g = this.totalTime,	//总时间
			h = Math.ceil(g / f), //间隔
			i = new Date; //开始时间

			
			try {
				window.clearInterval(this.animateHandler)
			} catch(j) {}

			var k = this;
			this.animateHandler = window.setInterval(function() {
				k._scrollAnim(c, d, i, g)
			},h)

		},
		_scrollAnim:function(a,b,c,d){
			var h = function(a) {
					//return - ((a -= 1) * a * a * a - 1)
					return a;
				};
			var e = new Date,
			f = (e.getTime() - c.getTime()) / d; //时间进度 0-1
			f >= 1 && (f = 1, window.clearInterval(this.animateHandler), this.running = !1);

			//var g = a + h(f) * (b - a);

			var g=(jQuery.easing[this.easing] || jQuery.easing["swing"])(null,(e.getTime() - c.getTime()),a,(b-a),d)

			this.container.scrollLeft = g //滚动 包含了位置重置	
		}

	}
	return SimpleCarousel;
});

