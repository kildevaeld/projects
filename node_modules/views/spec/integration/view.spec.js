var View = views.View

describe('View', function () {

  it('should have a static "extend" function', function () {
    expect(View.extend).toEqual(jasmine.any(Function))
  })

  it('should be instanceof baseview', function () {
    var view = new View();
    expect(view).toEqual(jasmine.any(views.BaseView));
  });


  

});

xdescribe('Properties', function () {
  it('parse ui properties', function (done) {
    var view = new JaffaMVC.View({
      ui: {
        button: '.button'
      },
      template: '<button class="button">Ok</button>'
    });

    view.render();

    view.on('render', function () {

      expect(view.ui).toEqual(jasmine.any(Object));
      expect(view.ui.button).not.toBe(null);

      expect(view.ui.button).toEqual(view.$('.button')[0]);

      done();
    });
  });

  it('sould use @ui in events', function (done) {

    var spy = jasmine.createSpy('onclick')

    var view = new (JaffaMVC.View.extend({
      ui: {
        button: '.button'
      },
      template: '<button class="button">Ok</button>',
      events: {
        'click @ui.button': spy
      }
    }));



    view.on('render', function () {
      $(view.ui.button).click();
      expect(spy.calls.count()).toEqual(1);
      view.destroy();

      done();
    });

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(view.render().el)

  });
});

describe('Triggers', function () {

  it('should trigger events', function () {
    var view = new (View.extend({
      //template: '<button class="button">OK</button>',
      triggers: {
        'click': 'click'
      },
      ui: {
        button: '.button'
      }
    }));

    var spy = jasmine.createSpy('click');

    
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(view.render().el)
    
    view.on('click', spy);

    $(view.el).click();

    expect(spy.calls.count()).toEqual(1);
    view.destroy();

  });

  xit('should use @ui in triggers', function (done) {
    var view = new (View.extend({
      template: '<button class="button">OK</button>',
      triggers: {
        'click @ui.button': 'click'
      },
      ui: {
        button: '.button'
      }
    }));

    var spy = jasmine.createSpy('click');

    view.on('render', function () {

      view.on('click', spy);

      $(view.ui.button).click();

      expect(spy.calls.count()).toEqual(1);
      view.destroy();
      done();

    });
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(view.render().el);

  });

});

xdescribe('Events', function () {
  it('should parse model events', function () {
    var spy = jasmine.createSpy('model:change');
    var view = new (JaffaMVC.View.extend({
      template: '<button class="button">OK</button>',
      events: {
        'change model': spy
      },
      ui: {
        button: '.button'
      },
      model: new JaffaMVC.Model(),
    }));

    //view.render();

    view.model.set('key', 'value');

    expect(spy.calls.count()).toEqual(1);

    //view.destroy();
  });
})

