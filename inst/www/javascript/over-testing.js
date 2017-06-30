// Generated by CoffeeScript 1.8.0
var PartialTestLogger, checkIfOverTesting, continuePairwiseTesting, displayOverTestingPopup, doOmnibusTest, lastVariableList, root, theLogger, _base,
  __slice = [].slice;

theLogger = null;

lastVariableList = null;

PartialTestLogger = (function() {
  function PartialTestLogger() {
    this.log = {};
  }


  /**
   * Return a formatted key for the PartialTestLogger instance
   * @param  {string(s)} ivs [one or multiple strings of IV names]
   * @return {string}        [a formatted key for the PartialTestLogger instance]
   */

  PartialTestLogger.prototype.ivKey = function() {
    var ivs;
    ivs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return JSON.stringify(ivs.sort());
  };


  /**
   * Return the number of partial tests used
   * @param  {string} dv     [DV name]
   * @param  {string(s)} ivs [one or multiple strings of IV names]
   * @return {integer}       [the number of partial tests used]
   */

  PartialTestLogger.prototype.countMatchingTests = function() {
    var dv, ivs;
    dv = arguments[0], ivs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.log[dv][this.ivKey(ivs)];
  };


  /**
   * Reset the counter of the test matching the given parameters
   * @param  {string} dv     [DV name]
   * @param  {string(s)} ivs [one or multiple strings of IV names]
   */

  PartialTestLogger.prototype.resetMatchingTests = function() {
    var dv, ivs;
    dv = arguments[0], ivs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.log[dv][this.ivKey(ivs)] = 0;
  };


  /**
   * Update the number of partial tests used
   * @param  {object} variableList variables used
   */

  PartialTestLogger.prototype.update = function(variableList) {
    var allLevels, comparedLevels, dv, iv, ivs, theIvKey, _base, _base1;
    if (variableList["independent"].length !== 1) {
      return;
    }
    iv = variableList["independent"][0];
    comparedLevels = variableList["independent-levels"];
    allLevels = variables[iv]["dataset"].unique();
    dv = variableList["dependent"][0];
    ivs = [iv];
    theIvKey = this.ivKey(ivs);
    if (comparedLevels.length < allLevels.length) {
      if ((_base = this.log)[dv] == null) {
        _base[dv] = {};
      }
      if ((_base1 = this.log[dv])[theIvKey] == null) {
        _base1[theIvKey] = 0;
      }
      return this.log[dv][theIvKey]++;
    }
  };

  return PartialTestLogger;

})();


/**
 * Checks if there is cyclic testing for over-testing. The number of distributions involved should be > 2.
 * Also update the PartialTestLogger instance.
 * @return {Boolean} true if over-testing
 */

checkIfOverTesting = function() {
  return;
  var dv, iv, ivs;
  if (theLogger == null) {
    theLogger = new PartialTestLogger();
  }
  lastVariableList = listOfLevelsCompared[listOfLevelsCompared.length - 1];
  theLogger.update(lastVariableList);
  if (lastVariableList["independent"].length !== 1) {
    return;
  }
  dv = lastVariableList["dependent"][0];
  iv = lastVariableList["independent"][0];
  ivs = [iv];
  if (theLogger.countMatchingTests.apply(theLogger, [dv].concat(__slice.call(ivs))) === 2) {
    return displayOverTestingPopup(dv, iv);
  }
};


/**
Displays the popup (warning and corrective procedure) for over-testing
@param  {string} DV [Dependent variable]
@param  {string} IV [Independent variable]
 */

displayOverTestingPopup = function(DV, IV) {
  var div, htmlText, i, levels, testedPairs;
  root.VisiStat.UI.Dimmer.addDimmer();
  div = d3.select("body").append("div").attr("id", "overTestingPopup");
  testedPairs = [];
  levels = variables[IV]["dataset"].unique();
  i = 0;
  while (i < listOfLevelsCompared.length) {
    if (listOfLevelsCompared[i]["independent"] === IV) {
      testedPairs.push("<li>" + listOfLevelsCompared[i]["independent-levels"][0] + " vs. " + listOfLevelsCompared[i]["independent-levels"][1] + "</li>");
    }
    i++;
  }
  htmlText = "";
  htmlText += "<div class='overTestingHead'>Are these tests for single research questions?</div>" + "<div class='overTestingBody'>" + "You have compared the following pairs of " + fV(IV) + ":" + "<ul class='overTestingBody'>" + testedPairs.join() + "</ul>" + "Using multiple tests in one research question increases the probability of having a significant effect when there is really none (Type I error)." + "To avoid this error, we suggest using omni-bus test (e.g., ANOVA) followed by a post-hoc test instead. <br/>" + "</div>" + "<label class='overTesting'><input type='radio' name='test' onClick='doOmnibusTest()'/> The tests above are considered as <b>single</b> research question. " + "<span class='overTestingExplanation'>Perform omni-bus test: " + fV(DV) + " ~ " + fV(IV) + "(" + levels + "). </span></label>" + "<label class='overTesting'><input type='radio' name='test' onClick='continuePairwiseTesting()'/>The tests above are considered as <b>multiple</b> research questions." + "<span class='overTestingExplanation'>Continue with the tests you've selected.</span> </label>";
  div.html(htmlText);
};

continuePairwiseTesting = function() {
  var dv, iv;
  root.VisiStat.UI.Dimmer.removeDimmer();
  removeElementById("overTestingPopup");
  dv = lastVariableList["dependent"][0];
  iv = lastVariableList["independent"][0];
  return theLogger.resetMatchingTests(dv, iv);
};

doOmnibusTest = function() {
  var dv, iv, selectedVariables, selectedVisualisation;
  root.VisiStat.UI.Dimmer.removeDimmer();
  removeElementById("overTestingPopup");
  resetSVGCanvas();
  selectedVariables = listOfVariableSelections[numberOfEntriesInHistory - 1].clone();
  selectedVisualisation = "Boxplot";
  selectDefaultVisualisation();
  plotVisualisation();
  setVisibilityOfVisualisations();
  removeElementsByClassName("compareMean");
  d3.selectAll(".IQRs, .medians, .TOPFringes, .BOTTOMFringes, .TOPFringeConnectors, .BOTTOMFringeConnectors, .outliers, .CIs, .CITopFringes, .CIBottomFringes").style("opacity", "0.35");
  selectAllMeans();
  compareMeans();
  dv = lastVariableList["dependent"][0];
  iv = lastVariableList["independent"][0];
  return theLogger.resetMatchingTests(dv, iv);
};

root = typeof exports !== "undefined" && exports !== null ? exports : this;

if (root.VisiStat == null) {
  root.VisiStat = {};
}

if ((_base = root.VisiStat).OverTesting == null) {
  _base.OverTesting = {};
}

root.VisiStat.OverTesting.checkIfOverTesting = checkIfOverTesting;

//# sourceMappingURL=over-testing.js.map
