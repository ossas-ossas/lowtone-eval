// ec-canvas/ec-canvas.js
import { initChart } from './echarts';

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object,
      value: {}
    },
    width: {
      type: Number,
      value: 300
    },
    height: {
      type: Number,
      value: 200
    },
    disableScroll: {
      type: Boolean,
      value: false
    }
  },

  data: {
    chart: null
  },

  ready() {
    this.init();
  },

  methods: {
    init() {
      const { canvasId, width, height, ec } = this.data;
      
      if (!ec.onInit) {
        console.warn('ec.onInit is not defined');
        return;
      }

      const query = wx.createSelectorQuery().in(this);
      query.select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            const dpr = wx.getSystemInfoSync().pixelRatio;
            canvas.width = res[0].width * dpr;
            canvas.height = res[0].height * dpr;
            ctx.scale(dpr, dpr);
            
            const chart = ec.onInit(canvas, width, height, dpr);
            this.setData({
              chart
            });
          }
        });
    },

    touchStart(e) {
      if (this.data.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.data.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture('start', e);
      }
    },

    touchMove(e) {
      if (this.data.chart && e.touches.length > 0) {
        const touch = e.touches[0];
        const handler = this.data.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture('change', e);
      }
    },

    touchEnd(e) {
      if (this.data.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        const handler = this.data.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture('end', e);
      }
    },

    tap(e) {
      if (this.data.chart) {
        const touch = e.detail;
        const handler = this.data.chart.getZr().handler;
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
      }
    }
  }
});
