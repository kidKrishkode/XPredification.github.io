module.exports = {
    duplex: 1441,
    hash: [["0","*z"],["1","*y"],["2","*x"],["3","*w"],["4","*v"],["5","*u"],["6","*t"],["7","*s"],["8","*r"],["9","*q"],["&",0],["+",1],["=",2],["-",3],["a",4],["e",5],["i",6],["n",7],["u",8],["g",9],["r","!h"],["l","!i"],["t","!j"]],
    browser_data: [
        {
            name: "Chrome",
            version: 125
        },
        {
            name: "Microsoft Internet Explorer",
            version: 114
        },
        {
            name: "Firefox",
            version: 119
        },
        {
            name: "Safari",
            version: 80
        },
    ],
    error_templet: `
        <div class="workspace blbg" style="background: #0000009e;" id="errorPreview">
            <div class="errorView">
                <header class="flx"><img src="../public/favicon.png" alt="load"/>
                    <span style="cursor: pointer;" onclick="system.closePyError();">&times;</span>
                </header>
                <div class="error-message">
                    <i class="fa fa-times-circle-o"></i>
                    <h2>Error: <|error.code|>!</h2>
                    <small class="form-text text-muted">This error genaredted by system for handle unwanted useage of resource</small>
                    <p><|error.message|></p>
                <div class="btn btn-process" style="margin-top: 40px;" onclick="system.closePyError();"><i class="fa fa-refresh"></i> Re-try</div>
            </div>
        </div>`
};