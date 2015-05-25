;;加载基础需求
;;If Windows,在sbcl启动的bat里设置 chcp 65001
;;(load "~/quicklisp/setup.lisp")
(setf sb-impl::*default-external-format* :UTF-8)
(ql:quickload :hunchentoot)

(defpackage color-brain
  (:use :cl :hunchentoot))
(in-package :color-brain)

;;启动服务
(setf *show-lisp-errors-p* t)
(start 
 (make-instance 'hunchentoot:easy-acceptor 
				:port 8082 
				:access-log-destination "log/access.log"
				:message-log-destination "log/message.log"
				:error-template-directory  "www/errors/"
				:document-root "www/"))
