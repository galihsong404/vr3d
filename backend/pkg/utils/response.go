package utils

import (
	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Status  string      `json:"status"`
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

type ErrorResponse struct {
	Status  string      `json:"status"`
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

func SendSuccess(c *gin.Context, code int, message string, data interface{}, meta interface{}) {
	c.JSON(code, SuccessResponse{
		Status:  "success",
		Code:    code,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

func SendError(c *gin.Context, code int, message string, details interface{}) {
	c.JSON(code, ErrorResponse{
		Status:  "error",
		Code:    code,
		Message: message,
		Details: details,
	})
}
