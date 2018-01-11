import assert from 'assert';
import brain from '../../src';

describe('neural network options', () => {
  it('hiddenLayers', () => {
    let net = new brain.NeuralNetwork({ hiddenLayers: [8, 7] });

    net.train([{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}]);

    let json = net.toJSON();

    assert.equal(json.layers.length, 4);
    assert.equal(Object.keys(json.layers[1]).length, 8);
    assert.equal(Object.keys(json.layers[2]).length, 7);
  });

  it('hiddenLayers default expand to input size', () => {
    let net = new brain.NeuralNetwork();

    net.train([{input: [0, 0, 1, 1, 1, 1, 1, 1, 1], output: [0]},
               {input: [0, 1, 1, 1, 1, 1, 1, 1, 1], output: [1]},
               {input: [1, 0, 1, 1, 1, 1, 1, 1, 1], output: [1]},
               {input: [1, 1, 1, 1, 1, 1, 1, 1, 1], output: [0]}]);

    let json = net.toJSON();

    assert.equal(json.layers.length, 3);
    assert.equal(Object.keys(json.layers[1]).length, 4, '9 input units means 4 hidden');
  });

  it('learningRate - higher learning rate should train faster', () => {
    let data = [{input: [0, 0], output: [0]},
                {input: [0, 1], output: [1]},
                {input: [1, 0], output: [1]},
                {input: [1, 1], output: [1]}];

    let net1 = new brain.NeuralNetwork();
    let net2 = new brain.NeuralNetwork();

    net1.train(data, {
      learningRate: 0.5,
      doneCallback: (res) => {
        net2.train(data, {
          learningRate: 0.8,
          doneCallback: (res2) => {
            assert.ok(res.iterations > (res2.iterations * 1.1), res.iterations + ' !> ' + res2.iterations * 1.1);
          }
        });
      }
    });
  });

  it('learningRate - backwards compatibility', () => {
    let data = [{input: [0, 0], output: [0]},
                {input: [0, 1], output: [1]},
                {input: [1, 0], output: [1]},
                {input: [1, 1], output: [1]}];

    let net1 = new brain.NeuralNetwork({ learningRate: 0.5 });
    let net2 = new brain.NeuralNetwork( { learningRate: 0.8 });

    net1.train(data, {
      doneCallback: (res) => {
        net2.train(data, {
          doneCallback: (res2) => {
            assert.ok(res.iterations > (res2.iterations * 1.1), res.iterations + ' !> ' + res2.iterations * 1.1);
          }
        });
      }
    });
  });

  it('momentum - higher momentum should train faster', () => {
    let data = [{input: [0, 0], output: [0]},
                {input: [0, 1], output: [1]},
                {input: [1, 0], output: [1]},
                {input: [1, 1], output: [1]}];

    let net1 = new brain.NeuralNetwork({ momentum: 0.1 });
    let net2 = new brain.NeuralNetwork({ momentum: 0.5 });

    net1.train(data, {
      doneCallback: (res) => {
        net2.train(data, {
          doneCallback: (res2) => {
            assert.ok(res.iterations > (res2.iterations * 1.1), res.iterations + ' !> ' + (res2.iterations * 1.1));
          }
        });
      }
    });

  });

  describe('log', () => {
    let logCalled;

    beforeEach(() => {
      logCalled = false;
    });

    function logFunction() {
      logCalled = true;
    }

    function trainWithLog(log) {
      let net = new brain.NeuralNetwork();
      net.train([{input: [0], output: [0]}], {
          log: log,
          logPeriod: 1,
          doneCallback: () => { assert.equal(logCalled, true); }
        });
    }

    it('should call console.log if log === true', () => {
      let originalLog = console.log;
      console.log = logFunction;

      trainWithLog(true);

      console.log = originalLog;
    });

    it('should call the given log function', () => {
      trainWithLog(logFunction);
    })
  })
});
