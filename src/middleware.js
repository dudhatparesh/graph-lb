"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var axios_1 = require("axios");
var app = express_1["default"]();
var PORT = Number(process.env.PORT) || 3000;
app.use(express_1["default"].json());
function fetchDataFromNode(url, query, variables) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].post(url, {
                            query: query,
                            variables: variables
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, { data: response.data, error: null }];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, { data: null, error: error_1.toString() }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
app.use(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var nodes, _a, query, variables, latestData, latestBlock, _i, nodes_1, node, _b, data, error, currentBlock;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                nodes = process.env.NODE_URLS.split(',')||[];
                _a = req.body, query = _a.query, variables = _a.variables;
                // Validating if query and variables are provided in request body
                if (!query || !variables) {
                    return [2 /*return*/, res.status(400).json({ error: 'Query and variables are required in the request body' })];
                }
                // Modifying query to add _meta{block{number}} before the last }
                query = query.trim();
                query = query.slice(0, -1) + ' _meta{block{number}}}';
                latestData = null;
                latestBlock = -1;
                _i = 0, nodes_1 = nodes;
                _d.label = 1;
            case 1:
                if (!(_i < nodes_1.length)) return [3 /*break*/, 4];
                node = nodes_1[_i];
                return [4 /*yield*/, fetchDataFromNode(node, query, variables)];
            case 2:
                _b = _d.sent(), data = _b.data, error = _b.error;
                if (error) {
                    console.error("Error fetching data from " + node + ": " + error);
                    return [3 /*break*/, 3];
                }
                currentBlock = (_c = data === null || data === void 0 ? void 0 : data.data._meta.block.number) !== null && _c !== void 0 ? _c : -1;
                if (currentBlock > latestBlock) {
                    latestBlock = currentBlock;
                    latestData = data;
                }
                _d.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                if (latestData === null) {
                    return [2 /*return*/, res.status(500).json({ error: 'Unable to fetch data from nodes' })];
                }
                req.graphData = latestData;
                next();
                return [2 /*return*/];
        }
    });
}); });
app.post('/get-data', function (req, res) {
    res.json(req.graphData);
});
app.listen(PORT, function () {
    console.log("Server is running on http://localhost:" + PORT);
});
