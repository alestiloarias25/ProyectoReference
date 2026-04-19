from django.urls import path
from .views import (
    register,
    forgot_password,
    reset_password,
    login,
    admin_users,
    admin_user_detail,
    check_document,
)

urlpatterns = [
    path("check-document/", check_document),
    path("register/", register),
    path("login/", login),
    path("forgot-password/", forgot_password),
    path("reset-password/<uuid:token>/", reset_password),
    path("users/", admin_users),
    path("users/<int:user_id>/", admin_user_detail),
]
