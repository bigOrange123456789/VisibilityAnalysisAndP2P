import { Viewer } from './viewer.js';
class App
{
  constructor (el)
  {
    this.el = el;
    this.viewer = null;
    this.viewerEl = null;

    if (this.viewer) this.viewer.clear();

    var parseUrlParams = function()
    {
      var urlParams = window.location.href;
      var vars = {};
      var parts = urlParams.replace(/[?&]+([^=&]+)=([^&]*)/gi,
          function (m, key, value) {
            vars[key] = decodeURIComponent(value);
          });

      return vars;
    }

    var paramJson = parseUrlParams();
    window.projectName = paramJson.scene
    this.createViewer(paramJson);

    var scenes =
        [
          {url: 'assets\\models\\canting.zip', tag: 1},
          {url: 'assets\\models\\SAM_Review_1.zip', tag: 2}
        ];


    if (paramJson.scene)
    {
      scenes =
          [
            {url: 'assets\\models\\' + paramJson.scene + '.zip', tag: 1}
          ]
    }

    
    //var scenes = 'assets\\models\\mtltest.zip';
    if(this.viewer.load)
    this.viewer.load(scenes);
  }

  createViewer(paramJson)
  {
    this.viewerEl = document.createElement('div');
    this.viewerEl.classList.add('viewer');
    this.el.appendChild(this.viewerEl);
    this.viewer = new Viewer(this.viewerEl, {
      baked: paramJson['baked'],
    });
    return this.viewer;
  }
}

var app = null;
document.addEventListener('DOMContentLoaded', () => {

  app = new App(document.body);

});
