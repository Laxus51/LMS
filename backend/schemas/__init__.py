# Schemas package
from .chat import ChatConversation, ChatMessage, ChatRequest, ChatResponse, ChatConversationCreate, ChatMessageCreate
from .mock_exam import (
    MockExam, MockExamRequest, MockExamResponse, MockExamSubmission, 
    MockExamResultResponse, MockExamListResponse, MockExamAccessResponse
)
from .mentor_session import (
    MentorProfileCreate, MentorProfileUpdate, MentorProfileResponse,
    MentorAvailabilityCreate, MentorAvailabilityUpdate, MentorAvailabilityResponse,
    MentorSessionCreate, MentorSessionUpdate, MentorSessionResponse,
    SessionPaymentRequest, SessionPaymentResponse,
    SessionBookingRequest, SessionBookingResponse,
    AvailableTimeSlotsRequest, AvailableTimeSlotsResponse,
    MentorListResponse, SessionReviewCreate, SessionReviewResponse,
    MentorDashboardStats, StudentDashboardStats
)

__all__ = [
    'ChatConversation', 'ChatMessage', 'ChatRequest', 'ChatResponse', 'ChatConversationCreate', 'ChatMessageCreate',
    'MockExam', 'MockExamRequest', 'MockExamResponse', 'MockExamSubmission', 
    'MockExamResultResponse', 'MockExamListResponse', 'MockExamAccessResponse',
    'MentorProfileCreate', 'MentorProfileUpdate', 'MentorProfileResponse',
    'MentorAvailabilityCreate', 'MentorAvailabilityUpdate', 'MentorAvailabilityResponse',
    'MentorSessionCreate', 'MentorSessionUpdate', 'MentorSessionResponse',
    'SessionPaymentRequest', 'SessionPaymentResponse',
    'SessionBookingRequest', 'SessionBookingResponse',
    'AvailableTimeSlotsRequest', 'AvailableTimeSlotsResponse',
    'MentorListResponse', 'SessionReviewCreate', 'SessionReviewResponse',
    'MentorDashboardStats', 'StudentDashboardStats'
]