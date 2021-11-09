import React,{useState,useEffect,useRef } from

"https://cdn.skypack.dev/react@17.0.1";
import ReactDOM from "https://cdn.skypack.dev/react-dom@17.0.1";
import classnames from "https://cdn.skypack.dev/classnames@2.3.1";

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel };

};

function App() {
  return (
    React.createElement("div", { id: "app" },
    React.createElement(Clock, null)));


}

function Clock() {
  const DEFAULT_BREAK_LENGTH = 5;
  const DEFAULT_SESSION_LENGTH = 25;

  const [started, setStarted] = useState(false);

  const [breakLength, setBreakLength] = useState(DEFAULT_BREAK_LENGTH);
  const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION_LENGTH);

  const [activeClock, setActiveClock] = useState("S");

  const [reset, setReset] = useState(0);

  return (
    React.createElement("div", { className: "clock" },
    React.createElement("div", { className: "title" }, "25 + 5 Clock"),
    React.createElement("div", { className: "length-setters" },
    React.createElement(LengthSetter, {
      type: "break",
      disabled: started,
      label: "Break Length",
      length: breakLength,
      setter: setBreakLength }),

    React.createElement(LengthSetter, {
      type: "session",
      disabled: started,
      label: "Session Length",
      length: sessionLength,
      setter: setSessionLength })),

    React.createElement(Display,
    {
      started,
      reset,
      activeClock,
      setActiveClock,
      breakLength,
      sessionLength }),


    React.createElement(Controls, { setStarted, onReset: handleReset }),
    React.createElement("p", null),
    React.createElement("div", { className: "design" }, "Designed and Coded by"),
    React.createElement("div", { className: "author" }, "Michael Buen")));



  function handleReset() {
    setBreakLength(DEFAULT_BREAK_LENGTH);
    setSessionLength(DEFAULT_SESSION_LENGTH);
    setActiveClock("S");
    setReset(reset + 1);
    setStarted(false);
  }
}

function LengthSetter({ type, label, length, setter, disabled }) {
  const labelId = type + "-label";
  const decrementId = type + "-decrement";
  const incrementId = type + "-increment";
  const lengthId = type + "-length";

  return (
    React.createElement("div", { className: "length-setter" },
    React.createElement("div", { id: labelId, className: "label" },
    label),

    React.createElement("button", { id: decrementId, onClick: decrement },
    React.createElement("i", { className: "fa fa-arrow-down fa-2x" })),

    React.createElement("span", { id: lengthId }, length),
    React.createElement("button", { id: incrementId, onClick: increment },
    React.createElement("i", { className: "fa fa-arrow-up fa-2x" }))));

  function decrement() {
    if (disabled) {
      return;
    }

    if (length > 1) {
      setter(length - 1);
    }
  }

  function increment() {
    if (disabled) {
      return;
    }

    if (length < 60) {
      setter(length + 1);
    }
  }
}

function Display({
  started,
  reset,
  activeClock,
  setActiveClock,
  sessionLength,
  breakLength })
{
  const audioRef = useRef();

  const [timer, setTimer] = useState(
  (activeClock === "S" ? sessionLength : breakLength) * 60);


  useEffect(() => {
    if (started) {
      const interval = accurateInterval(countDown, 1000);

      return function cleanup() {
        interval.cancel();
      };
    }
  }, [started]);

  useEffect(() => {
    setTimer(sessionLength * 60);
  }, [sessionLength]);

  useEffect(() => {
    setTimer((activeClock === "S" ? sessionLength : breakLength) * 60);
  }, [activeClock]);

  useEffect(() => {
    const audioEl = audioRef.current;
    audioEl.pause();
    audioEl.currentTime = 0;
  }, [reset]);

  return (
    React.createElement("div", { className: classnames("display", { imminent: timer < 60 }) },
    React.createElement("div", { id: "timer-label" },
    activeClock === "S" ? "Session" : "Break"),

    React.createElement("div", { id: "time-left", className: "time-left" },
    clockify()),

    React.createElement("audio", {
      id: "beep",
      preload: "auto",
      ref: audioRef,
      src: "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav" })));

  function countDown() {
    setTimer(prevTimer => {
      if (prevTimer > 0) {
        return prevTimer - 1;
      } else if (prevTimer === 0) {
        setActiveClock(ac => ac === "S" ? "B" : "S");
        const audioEl = audioRef.current;
        audioEl.play();

        return prevTimer;
      } else {
        throw Error(`Timer ${prevTimer} should not happen`);
      }
    });
  }

  function clockify() {
    const SECONDS_IN_MINUTES = 60;
    let minutes = Math.floor(timer / SECONDS_IN_MINUTES);
    let seconds = timer - minutes * SECONDS_IN_MINUTES;

    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;

    return minutes + ":" + seconds;
  }
}

function Controls({ setStarted, onReset }) {
  return (
    React.createElement("div", { className: "controls" },
    React.createElement("button", {id: "start_stop",className: "start-stop",onClick: handleStartStop},

    React.createElement("i", { className: "fa fa-play fa-2x" }),
    React.createElement("i", { className: "fa fa-pause fa-2x" })),

    React.createElement("button", { id: "reset", className: "reset", onClick: onReset },
    React.createElement("i", { className: "fa fa-refresh fa-2x" }))));

  function handleStartStop() {
    setStarted(started => !started);
  }
}