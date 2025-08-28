"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEtfDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_etf_dto_1 = require("./create-etf.dto");
class UpdateEtfDto extends (0, mapped_types_1.PartialType)(create_etf_dto_1.CreateEtfDto) {
}
exports.UpdateEtfDto = UpdateEtfDto;
//# sourceMappingURL=update-etf.dto.js.map